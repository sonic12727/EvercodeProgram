const LEVELS = { debug: 0, info: 1, warn: 2, error: 3 };

function createLogger(appName, minLevel = 'debug')
{
    const currentLevel = LEVELS[minLevel] ?? LEVELS.info;

    const log = (level, message, context = {}) =>
    {
        if (LEVELS[level] < currentLevel) return;

        const timestamp = new Date().toISOString();
        const requestId = context.requestId || 'global';
        const { requestId: _, ...cleanContext } = context;

        const logEntry =
        {
            timestamp,
            appName,
            level: level.toUpperCase(),
            requestId,
            message,
            ...cleanContext,
        };

        console.log(JSON.stringify(logEntry));
    };

    return{
        debug: (message, context) => log('debug', message, context),
        info: (message, context) => log('info', message, context),
        warn: (message, context) => log('warn', message, context),
        error: (message, context) => log('error', message, context),
    };
}

module.exports = createLogger;
