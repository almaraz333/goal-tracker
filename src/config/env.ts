/**
 * Environment configuration
 * 
 * Centralized access to environment variables with type safety
 */

interface EnvConfig {
  /** Path to the Goals directory */
  goalsPath: string;
  /** Obsidian Local REST API URL */
  obsidianApiUrl: string;
  /** Obsidian API Key */
  obsidianApiKey: string;
  /** Whether to use mock data instead of real files */
  useMockData: boolean;
  /** Whether we're in development mode */
  isDev: boolean;
}

export const env: EnvConfig = {
  goalsPath: import.meta.env.VITE_GOALS_PATH ?? '../Goals',
  obsidianApiUrl: import.meta.env.VITE_OBSIDIAN_API_URL ?? 'http://localhost:27124',
  obsidianApiKey: import.meta.env.VITE_OBSIDIAN_API_KEY ?? '',
  useMockData: import.meta.env.VITE_USE_MOCK_DATA === 'true',
  isDev: import.meta.env.DEV,
};
