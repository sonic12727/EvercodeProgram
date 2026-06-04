require('dotenv').config();

const { config, validateConfig } = require('./config/config');
const createLogger = require('./utils/logger');
const Scheduler = require('./services/scheduler');
const initDatabase = require('./config/db');
const CurrencyRepository = require('./repositories/currencyRepository');
const CurrencyService = require('./services/currencyService');
const { createWebServer } = require('./web/server');
const { ValidationError, SchedulerError } = require('./errors');

async function main()
{
    try 
    {
        validateConfig(config);
        const logger = createLogger(config.appName, 'debug');
        logger.info('Application starting...');

        // Запускаем планировщик
        const scheduler = new Scheduler(config, logger);
        scheduler.start();

        // 1. Инициализируем базу данных SQLite
        const db = initDatabase(config.settings.environment);
        logger.info('SQLite database initialized successfully');

        // 2. Создаем слой репозитория и сервиса данных
        const currencyRepository = new CurrencyRepository(db);
        const currencyService = new CurrencyService(currencyRepository);

        // 3. Запускаем веб-сервер, передавая логгер и сервис как зависимости
        const app = createWebServer(logger, currencyService);
        const port = process.env.PORT || 3000;

        const server = app.listen(port, () =>
        {
            logger.info(`Server running on port ${port}`);
        });

        const shutdown = (signal) =>
        {
            logger.info(`Received ${signal}, shutting down gracefully...`);
            scheduler.stop();

            // Закрываем соединение с БД перед выходом
            if (db && db.open)
            {
                db.close();
                logger.info('Database connection closed');
            }

            server.close(() =>
            {
                logger.info('HTTP server closed');
                process.exit(0);
            });
        };

        process.on('SIGINT', () => shutdown('SIGINT'));
        process.on('SIGTERM', () => shutdown('SIGTERM'));

        process.on('uncaughtException', (error) =>
        {
            logger.error('Uncaught exception', { error: error.message, stack: error.stack });
            process.exit(1);
        });

        process.on('unhandledRejection', (reason) =>
        {
            logger.error('Unhandled rejection', { reason });
            process.exit(1);
        });
    }
    catch (error)
    {
        console.error(`[UNEXPECTED ERROR] ${error.message}`);
        process.exit(1);
    }
}

main();