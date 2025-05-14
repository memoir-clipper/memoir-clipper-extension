/**
 * Environment utility to determine current environment and access env variables
 */

export enum Environment {
    DEVELOPMENT = 'development',
    PRODUCTION = 'production',
}

export const getEnvironment = (): Environment => {
    return (import.meta.env.VITE_APP_ENV as Environment) || Environment.DEVELOPMENT;
};

export const isDevelopment = (): boolean => {
    return getEnvironment() === Environment.DEVELOPMENT;
};

export const isProduction = (): boolean => {
    return getEnvironment() === Environment.PRODUCTION;
};
