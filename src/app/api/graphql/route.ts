import { createYoga } from 'graphql-yoga';
import { schema, type GraphQLContext } from '@/graphql/schema';
import { CURRENCY_COOKIE, isCurrency } from '@/lib/currency';

const yoga = createYoga<object, GraphQLContext>({
  schema,
  graphqlEndpoint: '/api/graphql',
  // GraphiQL is served on GET so the API can be explored in the browser.
  graphiql: {
    title: 'Threadline GraphQL API',
    defaultQuery: /* GraphQL */ `query NewArrivals {
  products(filter: { department: women }, sort: newest, first: 3) {
    total
    items { title brand price(currency: EUR) { formatted } sizes }
  }
}`,
  },
  fetchAPI: { Response },
  context: ({ request }) => {
    const cookie = request.headers.get('cookie') ?? '';
    const match = cookie.match(new RegExp(`${CURRENCY_COOKIE}=([A-Z]{3})`));
    return { currency: match && isCurrency(match[1]) ? match[1] : 'USD' };
  },
});

export async function GET(request: Request) {
  return yoga.handleRequest(request, {});
}

export async function POST(request: Request) {
  return yoga.handleRequest(request, {});
}

export async function OPTIONS(request: Request) {
  return yoga.handleRequest(request, {});
}
