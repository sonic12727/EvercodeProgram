const Scheduler = require('../scheduler');

describe('Scheduler', () =>
{
    let mockLogger;
    let mockConfig;
    let scheduler;

    beforeEach(() =>
    {
        jest.useFakeTimers();
        mockLogger = {
            info: jest.fn(),
            error: jest.fn(),
            warn: jest.fn(),
            debug: jest.fn(),
        };
        mockConfig = { appName: 'TestApp', settings: { schedulerIntervalMs: 5000 } };
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
        expect(setInterval).toHaveBeenCalledTimes(1);
        expect(setInterval).toHaveBeenCalledWith(expect.any(Function), mockConfig.settings.schedulerIntervalMs);
        expect(mockLogger.info).toHaveBeenCalledWith(expect.stringContaining('Scheduler started'));
    });

    test('stop() очищает интервал и логирует остановку', () =>
    {
        scheduler.start();
        scheduler.stop();
        expect(clearInterval).toHaveBeenCalledTimes(1);
        expect(mockLogger.info).toHaveBeenCalledWith('Scheduler stopped');
        expect(scheduler.intervalId).toBeNull();
    });
});