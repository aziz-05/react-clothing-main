import { createSchema } from 'graphql-yoga';
import { GraphQLError } from 'graphql';
import { allProducts, categories, DEPARTMENTS, facets, filterProducts, productById, productBySlug, related, type ProductFilter, type Sort } from '@/lib/catalog';
import { CURRENCIES, isCurrency, money } from '@/lib/currency';
import type { CurrencyCode, Product } from '@/lib/types';

export type GraphQLContext = { currency: CurrencyCode };

const typeDefs = /* GraphQL */ `
  enum CurrencyCode { USD EUR GBP JPY AUD }
  enum Department { women men accessories }
  enum ProductSort { featured newest price_asc price_desc rating }

  type Money { amount: Float!, currency: CurrencyCode!, formatted: String! }
  type Currency { code: CurrencyCode!, symbol: String!, label: String! }

  type Review { rating: Int!, comment: String!, date: String!, author: String! }

  type RatingSummary { average: Float!, count: Int!, breakdown: [Int!]! }

  type Product {
    id: ID!
    slug: String!
    title: String!
    brand: String!
    department: Department!
    category: Category!
    description: String!
    price(currency: CurrencyCode): Money!
    compareAtPrice(currency: CurrencyCode): Money
    discountPercent: Int!
    rating: RatingSummary!
    stock: Int!
    inStock: Boolean!
    isNew: Boolean!
    images: [String!]!
    thumbnail: String!
    sizes: [String!]!
    tags: [String!]!
    reviews: [Review!]!
    related(first: Int = 4): [Product!]!
  }

  type Category { slug: String!, name: String!, department: Department!, productCount: Int!, image: String! }
  type DepartmentInfo { slug: Department!, name: String!, blurb: String!, categories: [Category!]! }

  type FacetValue { value: String!, count: Int! }
  type PriceRange { min: Int!, max: Int! }
  type Facets { brands: [FacetValue!]!, sizes: [FacetValue!]!, priceRange: PriceRange! }

  type ProductPage { items: [Product!]!, total: Int!, hasMore: Boolean!, facets: Facets! }

  input ProductFilter {
    department: Department
    category: String
    brands: [String!]
    sizes: [String!]
    minPrice: Int
    maxPrice: Int
    inStock: Boolean
    onSale: Boolean
    query: String
  }

  input BagItemInput { productId: ID!, size: String, quantity: Int! }

  type BagLine { product: Product!, size: String, quantity: Int!, unitPrice: Money!, lineTotal: Money! }
  type BagQuote {
    lines: [BagLine!]!
    subtotal: Money!
    discount: Money!
    shipping: Money!
    total: Money!
    promoApplied: String
    freeShippingRemaining: Money!
    warnings: [String!]!
  }

  input ShippingInput { name: String!, email: String!, address: String!, city: String!, postalCode: String!, country: String! }
  input PlaceOrderInput { items: [BagItemInput!]!, shipping: ShippingInput!, promoCode: String }

  type OrderConfirmation { id: ID!, email: String!, total: Money!, itemCount: Int!, estimatedDelivery: String! }
  type NewsletterResult { ok: Boolean!, message: String! }

  type Query {
    currencies: [Currency!]!
    departments: [DepartmentInfo!]!
    categories(department: Department): [Category!]!
    products(filter: ProductFilter, sort: ProductSort = featured, first: Int = 12, offset: Int = 0): ProductPage!
    product(slug: String!): Product
    productsByIds(ids: [ID!]!): [Product!]!
    search(query: String!, first: Int = 6): [Product!]!
  }

  type Mutation {
    quoteBag(items: [BagItemInput!]!, promoCode: String, currency: CurrencyCode): BagQuote!
    placeOrder(input: PlaceOrderInput!, currency: CurrencyCode): OrderConfirmation!
    subscribeNewsletter(email: String!): NewsletterResult!
  }
`;

const FREE_SHIPPING_USD_CENTS = 150_00;
const SHIPPING_USD_CENTS = 9_00;
const PROMOS: Record<string, number> = { WELCOME10: 0.1, THREAD20: 0.2 };

const pick = (arg: unknown, ctx: GraphQLContext): CurrencyCode => (isCurrency(arg) ? arg : ctx.currency);

type ItemInput = { productId: string; size?: string | null; quantity: number };

/** Server-side pricing: the only place totals are calculated. */
function quote(items: ItemInput[], promoCode: string | null | undefined, currency: CurrencyCode) {
  if (items.length > 50) throw new GraphQLError('Too many items in bag');
  const warnings: string[] = [];
  const lines = items.flatMap((i) => {
    const product = productById(i.productId);
    if (!product) {
      warnings.push('An item in your bag is no longer available and was removed.');
      return [];
    }
    if (product.sizes.length && (!i.size || !product.sizes.includes(i.size))) {
      throw new GraphQLError(`Choose a valid size for ${product.title}`, { extensions: { code: 'BAD_USER_INPUT' } });
    }
    let quantity = Math.max(1, Math.min(10, Math.floor(i.quantity)));
    if (quantity > product.stock) {
      warnings.push(`Only ${product.stock} of ${product.title} left, so your quantity was adjusted.`);
      quantity = product.stock;
    }
    if (quantity === 0) return [];
    return [{ product, size: i.size ?? null, quantity }];
  });

  const subtotalUsd = lines.reduce((s, l) => s + l.product.priceCents * l.quantity, 0);
  const code = promoCode?.trim().toUpperCase();
  const rate = code ? PROMOS[code] : undefined;
  if (code && rate == null) throw new GraphQLError(`Promo code “${code}” is not valid`, { extensions: { code: 'BAD_USER_INPUT' } });
  const discountUsd = Math.round(subtotalUsd * (rate ?? 0));
  const shippingUsd = subtotalUsd === 0 || subtotalUsd - discountUsd >= FREE_SHIPPING_USD_CENTS ? 0 : SHIPPING_USD_CENTS;
  const totalUsd = subtotalUsd - discountUsd + shippingUsd;

  return {
    lines: lines.map((l) => ({
      ...l,
      unitPrice: money(l.product.priceCents, currency),
      lineTotal: money(l.product.priceCents * l.quantity, currency),
    })),
    subtotal: money(subtotalUsd, currency),
    discount: money(discountUsd, currency),
    shipping: money(shippingUsd, currency),
    total: money(totalUsd, currency),
    promoApplied: rate != null ? code : null,
    freeShippingRemaining: money(Math.max(0, FREE_SHIPPING_USD_CENTS - (subtotalUsd - discountUsd)), currency),
    warnings,
    totalUsd,
    itemCount: lines.reduce((n, l) => n + l.quantity, 0),
  };
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const resolvers = {
  Query: {
    currencies: () => CURRENCIES,
    departments: () =>
      DEPARTMENTS.map((d) => ({ ...d, categories: categories().filter((c) => c.department === d.slug) })),
    categories: (_: unknown, { department }: { department?: string }) =>
      categories().filter((c) => !department || c.department === department),
    products: (
      _: unknown,
      { filter, sort, first, offset }: { filter?: ProductFilter; sort: Sort; first: number; offset: number }
    ) => {
      const all = filterProducts(filter ?? {}, sort);
      const size = Math.min(Math.max(first, 1), 60);
      return {
        items: all.slice(offset, offset + size),
        total: all.length,
        hasMore: offset + size < all.length,
        facets: facets(filter ?? {}),
      };
    },
    product: (_: unknown, { slug }: { slug: string }) => productBySlug(slug),
    productsByIds: (_: unknown, { ids }: { ids: string[] }) =>
      ids.slice(0, 100).map(productById).filter(Boolean),
    search: (_: unknown, { query, first }: { query: string; first: number }) =>
      query.trim().length < 2 ? [] : filterProducts({ query: query.slice(0, 80) }, 'rating').slice(0, Math.min(first, 20)),
  },

  Mutation: {
    quoteBag: (_: unknown, a: { items: ItemInput[]; promoCode?: string; currency?: string }, ctx: GraphQLContext) =>
      quote(a.items, a.promoCode, pick(a.currency, ctx)),

    placeOrder: (
      _: unknown,
      a: { input: { items: ItemInput[]; promoCode?: string; shipping: Record<string, string> }; currency?: string },
      ctx: GraphQLContext
    ) => {
      const s = a.input.shipping;
      const missing = ['name', 'address', 'city', 'postalCode', 'country'].filter((k) => !s[k]?.trim());
      if (missing.length) throw new GraphQLError(`Missing shipping fields: ${missing.join(', ')}`, { extensions: { code: 'BAD_USER_INPUT' } });
      if (!EMAIL.test(s.email)) throw new GraphQLError('Enter a valid email address', { extensions: { code: 'BAD_USER_INPUT' } });
      const q = quote(a.input.items, a.input.promoCode, pick(a.currency, ctx));
      if (q.itemCount === 0) throw new GraphQLError('Your bag is empty', { extensions: { code: 'BAD_USER_INPUT' } });
      const eta = new Date();
      eta.setDate(eta.getDate() + 4);
      return {
        id: `TL-${Date.now().toString(36).toUpperCase()}`,
        email: s.email,
        total: q.total,
        itemCount: q.itemCount,
        estimatedDelivery: eta.toISOString(),
      };
    },

    subscribeNewsletter: (_: unknown, { email }: { email: string }) =>
      EMAIL.test(email)
        ? { ok: true, message: 'You’re on the list. Welcome to Threadline! Use WELCOME10 for 10% off.' }
        : { ok: false, message: 'Please enter a valid email address.' },
  },

  Product: {
    price: (p: Product, a: { currency?: string }, ctx: GraphQLContext) => money(p.priceCents, pick(a.currency, ctx)),
    compareAtPrice: (p: Product, a: { currency?: string }, ctx: GraphQLContext) =>
      p.compareAtCents ? money(p.compareAtCents, pick(a.currency, ctx)) : null,
    discountPercent: (p: Product) =>
      p.compareAtCents ? Math.round(((p.compareAtCents - p.priceCents) / p.compareAtCents) * 100) : 0,
    category: (p: Product) => categories().find((c) => c.slug === p.categorySlug),
    rating: (p: Product) => {
      const breakdown = [5, 4, 3, 2, 1].map((star) => p.reviews.filter((r) => r.rating === star).length);
      return { average: p.rating, count: p.reviews.length, breakdown };
    },
    inStock: (p: Product) => p.stock > 0,
    related: (p: Product, { first }: { first: number }) => related(p, Math.min(first, 12)),
  },

  Category: {
    productCount: (c: { count: number }) => c.count,
  },
};

export const schema = createSchema<GraphQLContext>({ typeDefs, resolvers });

export { allProducts };
