import { TAG, LogLevel, LOG_ENABLED, MINIMUM_LOG_LEVEL } from './constants';

/**
 * Logger utility for consistent application logging
 */
class Logger {
    private readonly isEnabled: boolean;
    private readonly logLevelPriority: Record<LogLevel, number> = {
        [LogLevel.DEBUG]: 0,
        [LogLevel.INFO]: 1,
        [LogLevel.WARN]: 2,
        [LogLevel.ERROR]: 3,
    };

    constructor() {
        this.isEnabled = LOG_ENABLED;
    }

    // --- CORE LOGGING METHODS ---

    public debug(message: string, ...args: any[]): void {
        this.log(LogLevel.DEBUG, message, ...args);
    }

    public info(message: string, ...args: any[]): void {
        this.log(LogLevel.INFO, message, ...args);
    }

    public warn(message: string, ...args: any[]): void {
        this.log(LogLevel.WARN, message, ...args);
    }

    public error(message: string, ...args: any[]): void {
        this.log(LogLevel.ERROR, message, ...args);
    }

    // --- GROUP LOGGING METHODS ---

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

    // --- PERFORMANCE LOGGING METHODS ---

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

    // --- HELPER METHODS ---

    private log(level: LogLevel, message: string, ...args: any[]): void {
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
        }
    }

    private shouldLog(level: LogLevel): boolean {
        return this.isEnabled && this.logLevelPriority[level] >= this.logLevelPriority[MINIMUM_LOG_LEVEL];
    }

    private formatMessage(level: LogLevel, message: string): string {
        return `[${TAG}][${level}] ${message}`;
    }

    private formatLabel(label: string): string {
        return `[${TAG}] ${label}`;
    }
}

// Export a singleton instance
export const logger = new Logger();
