import data from '@/data/catalog.json';
import type { Department, Product } from './types';

const products = data as Product[];

export const DEPARTMENTS: { slug: Department; name: string; blurb: string }[] = [
  { slug: 'women', name: 'Women', blurb: 'Dresses, tops, shoes and bags for every day and every evening.' },
  { slug: 'men', name: 'Men', blurb: 'Shirts, shoes and watches with clean lines and lasting quality.' },
  { slug: 'accessories', name: 'Accessories', blurb: 'Sunglasses and finishing touches.' },
];

export type Sort = 'featured' | 'newest' | 'price_asc' | 'price_desc' | 'rating';

export type ProductFilter = {
  department?: Department;
  category?: string;
  brands?: string[];
  sizes?: string[];
  minPrice?: number; // USD
  maxPrice?: number; // USD
  inStock?: boolean;
  onSale?: boolean;
  query?: string;
};

export const allProducts = () => products;
export const productBySlug = (slug: string) => products.find((p) => p.slug === slug) ?? null;
export const productById = (id: string) => products.find((p) => p.id === id) ?? null;

export function categories() {
  const map = new Map<string, { slug: string; name: string; department: Department; count: number; image: string }>();
  for (const p of products) {
    const existing = map.get(p.categorySlug);
    if (existing) existing.count++;
    else map.set(p.categorySlug, { slug: p.categorySlug, name: p.category, department: p.department, count: 1, image: p.thumbnail });
  }
  return [...map.values()];
}

const norm = (s: string) => s.toLowerCase().normalize('NFKD');

export function filterProducts(filter: ProductFilter = {}, sort: Sort = 'featured') {
  let items = products;
  const f = filter;
  if (f.department) items = items.filter((p) => p.department === f.department);
  if (f.category) items = items.filter((p) => p.categorySlug === f.category);
  if (f.brands?.length) items = items.filter((p) => f.brands!.includes(p.brand));
  if (f.sizes?.length) items = items.filter((p) => p.sizes.some((s) => f.sizes!.includes(s)));
  if (f.minPrice != null) items = items.filter((p) => p.priceCents >= f.minPrice! * 100);
  if (f.maxPrice != null) items = items.filter((p) => p.priceCents <= f.maxPrice! * 100);
  if (f.inStock) items = items.filter((p) => p.stock > 0);
  if (f.onSale) items = items.filter((p) => p.compareAtCents != null);
  if (f.query) {
    const terms = norm(f.query).split(/\s+/).filter(Boolean);
    items = items.filter((p) => {
      const hay = norm([p.title, p.brand, p.category, p.department, ...p.tags].join(' '));
      return terms.every((t) => hay.includes(t));
    });
  }

  const sorted = [...items];
  switch (sort) {
    case 'newest':
      sorted.sort((a, b) => Number(b.isNew) - Number(a.isNew));
      break;
    case 'price_asc':
      sorted.sort((a, b) => a.priceCents - b.priceCents);
      break;
    case 'price_desc':
      sorted.sort((a, b) => b.priceCents - a.priceCents);
      break;
    case 'rating':
      sorted.sort((a, b) => b.rating - a.rating);
      break;
  }
  return sorted;
}

/** Facet values computed over a filter with its own dimension removed. */
export function facets(filter: ProductFilter) {
  const base = filterProducts({ ...filter, brands: undefined, sizes: undefined });
  const count = (arr: string[]) => {
    const m = new Map<string, number>();
    arr.forEach((v) => m.set(v, (m.get(v) ?? 0) + 1));
    return [...m.entries()].map(([value, count]) => ({ value, count }));
  };
  const SIZE_ORDER = ['XS', 'S', 'M', 'L', 'XL', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45', 'One size'];
  return {
    brands: count(base.map((p) => p.brand)).sort((a, b) => a.value.localeCompare(b.value)),
    sizes: count(base.flatMap((p) => p.sizes)).sort((a, b) => SIZE_ORDER.indexOf(a.value) - SIZE_ORDER.indexOf(b.value)),
    priceRange: {
      min: Math.floor(Math.min(...base.map((p) => p.priceCents), 0) / 100),
      max: Math.ceil(Math.max(...base.map((p) => p.priceCents), 0) / 100),
    },
  };
}

export function related(product: Product, first = 4) {
  return products
    .filter((p) => p.id !== product.id)
    .map((p) => ({ p, s: (p.categorySlug === product.categorySlug ? 3 : 0) + (p.department === product.department ? 1 : 0) + (p.brand === product.brand ? 1 : 0) }))
    .filter((x) => x.s > 0)
    .sort((a, b) => b.s - a.s || b.p.rating - a.p.rating)
    .slice(0, first)
    .map((x) => x.p);
}
