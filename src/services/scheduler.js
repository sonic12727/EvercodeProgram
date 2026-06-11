const axios = require('axios');
const { SchedulerError } = require('../errors');

class Scheduler
{
    constructor(config, logger, currencyService)
    {
        // Зависимости
        this.config = config;
        this.logger = logger;
        this.currencyService = currencyService;
        this.intervalId = null;
        this.taskCounter = 0;
        this.isStopping = false;
    }

    async executeTask()
    {
        if (this.isStopping) return;

        this.taskCounter++;
        const taskId = `task-${this.taskCounter}`;

        try
        {
            this.logger.info(`Starting price update ${taskId}`, { taskId });

            const currencies = this.currencyService.getAll();

            if (currencies.length === 0)
            {
                this.logger.info(`No currencies found in local DB to update.`, { taskId });
                return;
            }

            const response = await axios.get('https://api.binance.com/api/v3/ticker/price', { timeout: 5000 });
            const allBinancePrices = response.data; // Массив объектов

            // Для каждой валюты из нашей БД фильтруем подходящие пары
            for (const crypto of currencies)
            {
                const ticker = crypto.ticker.toUpperCase();

                // Структура вида { pair, price }
                const mappedPrices = allBinancePrices.filter(p => p.symbol.includes(ticker)).map(p => ({ pair: p.symbol, price: p.price }));
                this.currencyService.updatePrices(ticker, mappedPrices);
            }

            this.logger.info(`Completed price update ${taskId}`, { taskId });
        }
        catch (error)
        {
            const schedulerError = new SchedulerError(taskId, error.message, { retryCount: 0 });
            this.logger.error(`Task failed: ${error.message}`,
                {
                    taskId,
                    error: error.message,
                    stack: error.stack,
                });
            throw schedulerError;
        }
    }

    start()
    {
        const intervalMs = this.config.settings.schedulerIntervalMs || 60000;
        this.logger.info(`Scheduler started with interval ${intervalMs}ms`);

        this.intervalId = setInterval(async () =>
        {
            try
            {
                await this.executeTask();
            }
            catch (error)
            {
                this.logger.error('Unhandled error in scheduler tick', { error: error.message });
            }
        }, intervalMs);
    }

    stop()
    {
        this.isStopping = true;

        if (this.intervalId)
        {
            clearInterval(this.intervalId);
            this.intervalId = null;
            this.logger.info('Scheduler stopped');
        }
    }
}

module.exports = Scheduler;