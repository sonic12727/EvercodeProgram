const AppError = require('../AppError');

describe('AppError', () =>
{
    test('создаётся с сообщением и корректным именем', () =>
    {
        const err = new AppError('Тестовая ошибка');
        expect(err.message).toBe('Тестовая ошибка');
        expect(err.name).toBe('AppError');
    });

    test('автоматически добавляет timestamp при создании', () =>
    {
        const err = new AppError('Проверка времени');
        expect(err.timestamp).toBeDefined();
        expect(typeof err.timestamp).toBe('string');
        // Проверяем, что это валидная ISO-строка
        expect(new Date(err.timestamp).toISOString()).toBe(err.timestamp);
    });

    test('принимает кастомные опции (code и context)', () =>
    {
        const options =
        {
            code: 'CUSTOM_CODE',
            context: { userId: 42, action: 'login' }
        };
        const err = new AppError('Ошибка контекста', options);

        expect(err.code).toBe('CUSTOM_CODE');
        expect(err.context).toEqual(options.context);
    });

    test('сохраняет стек вызовов', () =>
    {
        const err = new AppError('Stack test');
        expect(err.stack).toContain('AppError.test.js');
    });
});