import { TAG, LOG_ENABLED, MINIMUM_LOG_LEVEL } from '../values/constants';
import { LogLevel } from '../values/enums';

/**
 * Logger utility for consistent application logging.
 * Supports log levels, grouping, and performance timing.
 */
class Logger {
    private readonly isEnabled: boolean;
    private readonly logLevelPriority: Record<LogLevel, number> = {
        [LogLevel.DEBUG]: 0,
        [LogLevel.INFO]: 1,
        [LogLevel.WARN]: 2,
        [LogLevel.ERROR]: 3,
    };

    private readonly logColors: Record<LogLevel, string> = {
        [LogLevel.DEBUG]: '\x1b[36m', // Cyan
        [LogLevel.INFO]: '\x1b[32m', // Green
        [LogLevel.WARN]: '\x1b[33m', // Yellow
        [LogLevel.ERROR]: '\x1b[31m', // Red
    };

    private readonly resetColor: string = '\x1b[0m';

    constructor() {
        this.isEnabled = LOG_ENABLED;
    }

    // --- Core Logging Methods ---

    public debug(message: string, ...args: unknown[]): void {
        this.log(LogLevel.DEBUG, message, ...args);
    }

    public info(message: string, ...args: unknown[]): void {
        this.log(LogLevel.INFO, message, ...args);
    }

    public warn(message: string, ...args: unknown[]): void {
        this.log(LogLevel.WARN, message, ...args);
    }

    public error(message: string, ...args: unknown[]): void {
        this.log(LogLevel.ERROR, message, ...args);
    }

    // --- Group Logging Methods ---

    public group(label: string): void {
        if (this.isEnabled) {
            console.group(this.formatLabel(label));
        }
    }

    public groupEnd(): void {
        if (this.isEnabled) {
            console.groupEnd();
        }
    }

    // --- Performance Logging Methods ---

    public time(label: string): void {
        if (this.isEnabled) {
            console.time(this.formatLabel(label));
        }
    }

    public timeEnd(label: string): void {
        if (this.isEnabled) {
            console.timeEnd(this.formatLabel(label));
        }
    }

    // --- Helper Methods ---

    private log(level: LogLevel, message: string, ...args: unknown[]): void {
        if (!this.shouldLog(level)) return;

        const formattedMessage = this.formatMessage(level, message);
        switch (level) {
            case LogLevel.DEBUG:
                console.debug(formattedMessage, ...args);
                break;
            case LogLevel.INFO:
                console.info(formattedMessage, ...args);
                break;
            case LogLevel.WARN:
                console.warn(formattedMessage, ...args);
                break;
            case LogLevel.ERROR:
                console.error(formattedMessage, ...args);
                break;
            default:
                console.log(formattedMessage, ...args);
        }
    }

    private shouldLog(level: LogLevel): boolean {
        return this.isEnabled && this.logLevelPriority[level] >= this.logLevelPriority[MINIMUM_LOG_LEVEL];
    }

    private getTimestamp(): string {
        const now = new Date();
        const time = now.toTimeString().split(' ')[0];
        const milliseconds = String(now.getMilliseconds()).padStart(3, '0');
        return `${time}.${milliseconds}`;
    }

    private formatMessage(level: LogLevel, message: string): string {
        const timestamp = this.getTimestamp();
        return `${this.logColors[level]}[${timestamp}][${TAG}][${level}] ${message}${this.resetColor}`;
    }

    private formatLabel(label: string): string {
        return `\x1b[35m[${TAG}] ${label}${this.resetColor}`; // Purple for labels
    }
}

/**
 * Singleton logger instance for application-wide use.
 */
export const logger = new Logger();
