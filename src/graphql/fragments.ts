// Shared selection sets. Plain strings so both Server and Client Components can use them.

export const CARD_FIELDS = /* GraphQL */ `
  fragment CardFields on Product {
    id
    slug
    title
    brand
    thumbnail
    images
    isNew
    stock
    sizes
    discountPercent
    price { formatted }
    compareAtPrice { formatted }
    rating { average count }
  }
`;

export type CardProduct = {
  id: string;
  slug: string;
  title: string;
  brand: string;
  thumbnail: string;
  images: string[];
  isNew: boolean;
  stock: number;
  sizes: string[];
  discountPercent: number;
  price: { formatted: string };
  compareAtPrice: { formatted: string } | null;
  rating: { average: number; count: number };
};

export const QUOTE_BAG = /* GraphQL */ `
  mutation QuoteBag($items: [BagItemInput!]!, $promoCode: String) {
    quoteBag(items: $items, promoCode: $promoCode) {
      lines { product { id } size quantity unitPrice { formatted } lineTotal { formatted } }
      subtotal { formatted }
      discount { amount formatted }
      shipping { amount formatted }
      total { formatted }
      promoApplied
      freeShippingRemaining { amount formatted }
      warnings
    }
  }
`;

export type BagQuote = {
  lines: { product: { id: string }; size: string | null; quantity: number; unitPrice: { formatted: string }; lineTotal: { formatted: string } }[];
  subtotal: { formatted: string };
  discount: { amount: number; formatted: string };
  shipping: { amount: number; formatted: string };
  total: { formatted: string };
  promoApplied: string | null;
  freeShippingRemaining: { amount: number; formatted: string };
  warnings: string[];
};
