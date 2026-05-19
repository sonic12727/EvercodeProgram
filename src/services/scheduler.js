const { SchedulerError } = require('../errors');

class Scheduler
{
    constructor(config, logger)
    {
        this.config = config;
        this.logger = logger;      // теперь logger имеет методы .info, .error
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
            this.logger.info(`Starting ${taskId}`, { taskId });

            // Имитация работы (можно вынести в отдельный модуль задачи)
            await new Promise((resolve, reject) =>
            {
                setTimeout(() =>
                {
                    if (Math.random() > 0.9)
                    {
                        reject(new Error('Random task failure'));
                    }
                    else
                    {
                        resolve();
                    }
                }, 100);
            });

            this.logger.info(`Completed ${taskId}`, { taskId });
        }
        catch (error)
        {
            // Оборачиваем ошибку и логируем без падения процесса
            const schedulerError = new SchedulerError(taskId, error.message, { retryCount: 0 });
            this.logger.error(`Task failed: ${error.message}`, 
            {
                taskId,
                error: error.message,
                stack: error.stack,
            });
            // Можно здесь реализовать логику повтора, но по заданию просто логируем
            // Пробрасываем дальше, чтобы вызывающий код мог отреагировать (но не в setInterval)
            throw schedulerError;
        }
    }

    start()
    {
        const { schedulerIntervalMs } = this.config.settings;
        this.logger.info(`Scheduler started with interval ${schedulerIntervalMs}ms`);

        this.intervalId = setInterval(async () =>
        {
            try
            {
                await this.executeTask();
            }
            catch (error)
            {
                // Ошибка уже залогирована в executeTask, не даём процессу упасть
                // Дополнительно можно уведомить систему мониторинга
                this.logger.error('Unhandled error in scheduler tick', { error: error.message });
            }
        }, schedulerIntervalMs);
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
