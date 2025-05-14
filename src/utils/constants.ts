// This file contains constants that are used throughout the app

export const TAG = 'Memoir';

// Logging related constants
export enum LogLevel {
    DEBUG = 'DEBUG',
    INFO = 'INFO',
    WARN = 'WARN',
    ERROR = 'ERROR',
}

// Using environment variables from Vite
export const LOG_ENABLED = import.meta.env.VITE_LOG_ENABLED === 'true';
export const MINIMUM_LOG_LEVEL = (import.meta.env.VITE_MINIMUM_LOG_LEVEL as LogLevel) || LogLevel.ERROR;
