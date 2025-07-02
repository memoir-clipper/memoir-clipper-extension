/**
 * Utility for determining the current environment and accessing environment variables.
 */
export enum Environment {
    DEVELOPMENT = 'development',
    PRODUCTION = 'production',
}

/**
 * Returns the current environment.
 */
export function getEnvironment(): Environment {
    return (import.meta.env.VITE_APP_ENV as Environment) || Environment.DEVELOPMENT;
}

/**
 * Checks if the current environment is development.
 */
export function isDevelopment(): boolean {
    return getEnvironment() === Environment.DEVELOPMENT;
}

/**
 * Checks if the current environment is production.
 */
export function isProduction(): boolean {
    return getEnvironment() === Environment.PRODUCTION;
}
