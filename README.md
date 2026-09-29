# Threadline: fashion store on a GraphQL API

An editorial fashion e-commerce store built on a **GraphQL API** with **Next.js 15 (App Router)**,
**React 19**, **TypeScript**, **GraphQL Yoga**, **TanStack Query** and **Tailwind CSS 4**.

> Rebuilt from my original React + Redux “react-clothing” shop, which depended on a local GraphQL server
> that no longer existed. It now ships its own schema and resolvers, and everything works end to end.

## Features

- **GraphQL API** at `/api/graphql` (GraphQL Yoga), with an interactive **GraphiQL explorer** on `GET`.
- **One schema, two transports.** Server Components execute queries **in-process** against the same
  schema (no HTTP hop), while Client Components use it over HTTP through TanStack Query.
- **Multi-currency pricing** (USD, EUR, GBP, JPY, AUD). The currency lives in a cookie, so pages are
  **server-rendered in the shopper's currency** and every `Money` field resolves in it.
- **Shop and filters**: departments, categories, brand and size facets (with counts), price range,
  in-stock, sale, 5 sort orders and infinite "load more". Filters are synced to the URL and update
  instantly through client-side GraphQL, with no page reload.
- **Product pages**: gallery with hover zoom, required size selection, stock warnings, details accordion,
  **reviews with a rating breakdown**, and related products.
- **Quick view** modal, **search overlay** with live results, and a **wishlist**.
- **Bag drawer** priced by the server (`quoteBag` mutation): promo codes (`WELCOME10`, `THREAD20`),
  free-shipping threshold with progress, stock-aware quantity adjustments.
- **Checkout** through a `placeOrder` mutation that re-validates the bag, sizes, stock and address server-side.
- **Newsletter** signup mutation, responsive design, accessible dialogs and keyboard support.
- GitHub Actions CI: type-check and production build on every push.

## Example query

```graphql
query {
  products(filter: { department: women, sizes: ["M"], onSale: true }, sort: price_asc, first: 4) {
    total
    items {
      title
      brand
      price(currency: EUR) { formatted }
      compareAtPrice(currency: EUR) { formatted }
      rating { average count }
    }
    facets { brands { value count } priceRange { min max } }
  }
}
```

```graphql
mutation {
  quoteBag(items: [{ productId: "177", size: "M", quantity: 2 }], promoCode: "WELCOME10", currency: JPY) {
    subtotal { formatted }
    discount { formatted }
    shipping { formatted }
    total { formatted }
  }
}
```

## Tech stack

| Layer | Tools |
|---|---|
| Framework | Next.js 15 App Router, React 19 |
| API | GraphQL Yoga, graphql-js (in-process execution for RSC) |
| Data fetching | TanStack Query (infinite queries, mutations, cache invalidation) |
| State | Zustand with `persist` (bag, wishlist) |
| Styling | Tailwind CSS 4, Fraunces + Inter via `next/font` |
| Language | TypeScript (strict) |

## Getting started

```bash
npm install
npm run dev          # http://localhost:3000, GraphiQL at /api/graphql
npm run build && npm start
npm run typecheck
```

## Project structure

```
src/
  app/            routes: home, shop/[[...slug]], product/[slug], checkout, wishlist, api/graphql
  graphql/        schema + resolvers, in-process server executor, HTTP client, shared fragments
  components/     Header, BagDrawer, ShopBrowser, QuickView, SearchOverlay, Gallery…
  lib/            catalog queries, currency conversion
  store/          Zustand bag + wishlist
  data/           product catalog snapshot
```

Product data and imagery come from the [DummyJSON](https://dummyjson.com) demo catalog (snapshotted locally).

---

Built by [Abd Elaziz Hafallah](https://abd-elaziz-hafallah.vercel.app).
