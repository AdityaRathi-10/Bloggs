const isProd = process.env.NODE_ENV === "production";

type LogArgs = unknown[];

const logger = {
    log: (...args: LogArgs): void => {
        if (!isProd) console.log(...args);
    },
    error: (...args: LogArgs): void => {
        console.error(...args);
    },
};

export default logger;
