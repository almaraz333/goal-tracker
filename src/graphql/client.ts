/**
 * Apollo Client configuration for Obsidian Local REST API
 * 
 * Note: The Obsidian Local REST API plugin uses a REST interface,
 * not GraphQL. We'll set up Apollo Client for future GraphQL needs
 * and create a REST service layer for Obsidian communication.
 */

import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';

// Default configuration - will be updated when connecting to actual API
const httpLink = createHttpLink({
  uri: 'http://localhost:27123/graphql', // Placeholder - adjust based on actual API
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
