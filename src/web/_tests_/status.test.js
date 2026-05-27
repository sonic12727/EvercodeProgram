const request = require('supertest');
const { createWebServer } = require('../../src/web/server');

// Мокаем логгер, чтобы не засорять вывод тестов
const mockLogger =
{
    info: jest.fn(),
    debug: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
};

describe('GET /status', () =>
{
    let app;

    beforeEach(() =>
    {
        app = createWebServer(mockLogger);
    });

    test('возвращает статус 200 и тело "ok"', async () =>
    {
        const response = await request(app).get('/status');
        expect(response.statusCode).toBe(200);
        expect(response.text).toBe('ok');
    });

    test('логирует вызов через логгер', async () =>
    {
        await request(app).get('/status');
        expect(mockLogger.info).toHaveBeenCalledWith('Health check');
    });

    test('возвращает 404 на несуществующий маршрут', async () =>
    {
        const response = await request(app).get('/not-exist');
        expect(response.statusCode).toBe(404);
        expect(response.body).toEqual({ error: 'Not found' });
    });
});