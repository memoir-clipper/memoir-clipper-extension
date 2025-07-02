import { LogLevel } from '@/utils/values/enums';
import { Environment, getEnvironment } from '../helpers/environment';

/**
 * Application tag for logging and debugging.
 */
export const TAG = 'Memoir';

/**
 * Logging configuration using Vite environment variables.
 */
export const MINIMUM_LOG_LEVEL: LogLevel =
    getEnvironment() === Environment.PRODUCTION ? LogLevel.ERROR : LogLevel.DEBUG;

/**
 * Common string constants.
 */
export const TRUE = 'true';
export const FALSE = 'false';
export const MINUS_ONE = '-1';
