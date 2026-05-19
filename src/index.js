const { config, validateConfig } = require('./config/config');
const createLogger = require('./utils/logger');
const Scheduler = require('./services/scheduler');
const { ValidationError, SchedulerError } = require('./errors');

async function main()
{
    try
    {
        validateConfig(config);

        const logger = createLogger(config.appName, 'debug');
        logger.info('Application starting...');

        const scheduler = new Scheduler(config, logger);
        scheduler.start();

        const shutdown = (signal) => {
            logger.info(`Received ${signal}, shutting down gracefully...`);
            scheduler.stop();
            process.exit(0);
        };

        process.on('SIGINT', () => shutdown('SIGINT'));
        process.on('SIGTERM', () => shutdown('SIGTERM'));

        // Глобальная обработка непойманных ошибок
        process.on('uncaughtException', (error) => {
            logger.error('Uncaught exception', { error: error.message, stack: error.stack });
            process.exit(1);
        });
        process.on('unhandledRejection', (reason) => {
            logger.error('Unhandled rejection', { reason });
            process.exit(1);
        });
    }
    catch (error)
    {
        if (error instanceof ValidationError)
        {
            console.error(`[FATAL] Configuration validation failed:`);
            console.error(`  Field: ${error.field}`);
            console.error(`  Value: ${error.invalidValue}`);
            console.error(`  Message: ${error.message}`);
            process.exit(1);
        }

        if (error instanceof SchedulerError)
        {
            console.error(`[ERROR] Scheduler error occurred:`);
            console.error(`  Task: ${error.taskId}`);
            console.error(`  Message: ${error.message}`);
            console.error(`  Retry count: ${error.retryCount}`);
            process.exit(1);
        }

        console.error(`[UNEXPECTED ERROR] ${error.message}`);
        console.error(error.stack);
        process.exit(1);
    }
}

main();