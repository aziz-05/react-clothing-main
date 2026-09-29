export type Department = 'women' | 'men' | 'accessories';

export type Review = {
  rating: number;
  comment: string;
  date: string;
  author: string;
};

export type Product = {
  id: string;
  slug: string;
  title: string;
  brand: string;
  department: Department;
  category: string;
  categorySlug: string;
  description: string;
  priceCents: number; // base currency: USD
  compareAtCents: number | null;
  rating: number;
  stock: number;
  tags: string[];
  images: string[];
  thumbnail: string;
  sizes: string[];
  reviews: Review[];
  isNew: boolean;
};

export type CurrencyCode = 'USD' | 'EUR' | 'GBP' | 'JPY' | 'AUD';

export type BagItem = {
  key: string;
  productId: string;
  slug: string;
  title: string;
  brand: string;
  image: string;
  size?: string;
  quantity: number;
};
