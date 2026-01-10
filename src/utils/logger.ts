/**
 * Centralized logger utility
 * 
 * Provides consistent logging across the app with environment awareness.
 * Debug logs are only shown in development mode.
 */

const isDev = import.meta.env.DEV;

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LoggerConfig {
  prefix: string;
  enableDebug: boolean;
}

const defaultConfig: LoggerConfig = {
  prefix: '[GoalTracker]',
  enableDebug: isDev,
};

function formatMessage(level: LogLevel, prefix: string, ...args: unknown[]): unknown[] {
  const timestamp = new Date().toISOString().split('T')[1].slice(0, 8);
  return [`${prefix} [${timestamp}] [${level.toUpperCase()}]`, ...args];
}

/**
 * Main logger object with level-specific methods
 */
export const logger = {
  /**
   * Debug logs - only shown in development mode
   */
  debug: (...args: unknown[]): void => {
    if (defaultConfig.enableDebug) {
      console.log(...formatMessage('debug', defaultConfig.prefix, ...args));
    }
  },

  /**
   * Info logs - general information
   */
  info: (...args: unknown[]): void => {
    console.log(...formatMessage('info', defaultConfig.prefix, ...args));
  },

  /**
   * Warning logs - potential issues
   */
  warn: (...args: unknown[]): void => {
    console.warn(...formatMessage('warn', defaultConfig.prefix, ...args));
  },

  /**
   * Error logs - errors and exceptions
   */
  error: (...args: unknown[]): void => {
    console.error(...formatMessage('error', defaultConfig.prefix, ...args));
  },
};

/**
 * Create a scoped logger with a custom prefix
 */
export function createLogger(scope: string): typeof logger {
  const scopedPrefix = `${defaultConfig.prefix}[${scope}]`;
  
  return {
    debug: (...args: unknown[]): void => {
      if (defaultConfig.enableDebug) {
        console.log(...formatMessage('debug', scopedPrefix, ...args));
      }
    },
    info: (...args: unknown[]): void => {
      console.log(...formatMessage('info', scopedPrefix, ...args));
    },
    warn: (...args: unknown[]): void => {
      console.warn(...formatMessage('warn', scopedPrefix, ...args));
    },
    error: (...args: unknown[]): void => {
      console.error(...formatMessage('error', scopedPrefix, ...args));
    },
  };
}

export default logger;
