/**
 * Apollo Client configuration placeholder for future API integrations.
 * 
 * The current app stores goals locally and does not depend on a remote API.
 */

import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';

// Default configuration for future API usage.
const httpLink = createHttpLink({
  uri: 'http://localhost:27123/graphql',
});

export const apolloClient = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          goals: {
            merge: false,
          },
        },
      },
    },
  }),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-and-network',
    },
  },
});
