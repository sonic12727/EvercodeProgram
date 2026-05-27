const createLogger = require('../../../src/utils/logger');

describe('logger', () =>
{
    let logger;
    let consoleSpy;
    let logs;

    beforeEach(() =>
    {
        logs = [];
        consoleSpy = jest.spyOn(console, 'log').mockImplementation((msg) => {
            logs.push(msg);
        });
        logger = createLogger('TestApp', 'debug');
    });

    afterEach(() => {
        consoleSpy.mockRestore();
    });

    const parseLog = (logLine) => JSON.parse(logLine);

    test('info() выводит JSON с уровнем INFO', () => {
        logger.info('Test message', { userId: 42 });
        expect(logs.length).toBe(1);
        const parsed = parseLog(logs[0]);
        expect(parsed.level).toBe('INFO');
        expect(parsed.message).toBe('Test message');
        expect(parsed.userId).toBe(42);
        expect(parsed.requestId).toBe('global');
        expect(parsed.appName).toBe('TestApp');
    });

    test('error() выводит уровень ERROR', () => {
        logger.error('Error occurred');
        const parsed = parseLog(logs[0]);
        expect(parsed.level).toBe('ERROR');
    });

    test('debug() не выводится при minLevel = info', () => {
        const infoLogger = createLogger('TestApp', 'info');
        infoLogger.debug('Silent debug');
        expect(logs.length).toBe(0);
    });

    test('можно передать requestId в контексте', () => {
        logger.info('Request scoped', { requestId: 'abc-123', foo: 'bar' });
        const parsed = parseLog(logs[0]);
        expect(parsed.requestId).toBe('abc-123');
        expect(parsed.foo).toBe('bar');
        expect(parsed.requestId).not.toBe('global');
    });
});