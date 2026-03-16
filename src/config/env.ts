/**
 * Environment configuration
 * 
 * Centralized access to environment variables with type safety
 */

interface EnvConfig {
  /** Whether to use mock data instead of real files */
  useMockData: boolean;
  /** Whether we're in development mode */
  isDev: boolean;
}

export const env: EnvConfig = {
  useMockData: import.meta.env.VITE_USE_MOCK_DATA === 'true',
  isDev: import.meta.env.DEV,
};
