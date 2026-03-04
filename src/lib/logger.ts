const isDev = import.meta.env.DEV;

/**
 * A simple logger that only outputs messages in development mode.
 * Standard logs are stripped from production to prevent leaking UIDs/Emails.
 */
export const logger = {
    log: (...args: any[]) => {
        if (isDev) console.log(...args);
    },
    error: (...args: any[]) => {
        if (isDev) console.error(...args);
    },
    warn: (...args: any[]) => {
        if (isDev) console.warn(...args);
    },
    info: (...args: any[]) => {
        if (isDev) console.info(...args);
    },
    debug: (...args: any[]) => {
        if (isDev) console.debug(...args);
    },
};
