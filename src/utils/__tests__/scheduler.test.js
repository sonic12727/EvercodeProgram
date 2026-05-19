const Scheduler = require('../scheduler');

describe('Scheduler', () =>
{
    let mockLogger;
    let mockConfig;
    let scheduler;

    beforeEach(() =>
    {
        jest.useFakeTimers();
        mockLogger = jest.fn();
        mockConfig = { appName: 'TestApp',settings: { schedulerIntervalMs: 5000 } };
        scheduler = new Scheduler(mockConfig, mockLogger);
    });

    afterEach(() =>
    {
        jest.useRealTimers();
        scheduler.stop();
    });

    test('инициализируется с переданным конфигом и логгером', () =>
    {
        expect(scheduler.config).toBe(mockConfig);
        expect(scheduler.logger).toBe(mockLogger);
        expect(scheduler.intervalId).toBeNull();
    });

    test('start() создаёт интервал и логирует запуск', () =>
    {
        scheduler.start();

        // Проверяем, что setInterval был вызван 1 раз
        expect(setInterval).toHaveBeenCalledTimes(1);
        // Проверяем, что интервал равен значению из конфига
        expect(setInterval).toHaveBeenCalledWith(expect.any(Function),mockConfig.settings.schedulerIntervalMs);
        // Проверяем логирование
        expect(mockLogger).toHaveBeenCalledWith(expect.stringContaining('Scheduler started'));
    });

    test('stop() очищает интервал и логирует остановку', () =>
    {
        scheduler.start();
        scheduler.stop();

        expect(clearInterval).toHaveBeenCalledTimes(1);
        expect(mockLogger).toHaveBeenCalledWith('Scheduler stopped');
        expect(scheduler.intervalId).toBeNull();
    });
});