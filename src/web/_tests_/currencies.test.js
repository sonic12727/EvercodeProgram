const request = require('supertest');
const { createWebServer } = require('../server');
const initDatabase = require('../../config/db');
const CurrencyRepository = require('../../repositories/currencyRepository');
const CurrencyService = require('../../services/currencyService');

const mockLogger =
{
    info: jest.fn(),
    debug: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
};

process.env.API_TOKEN = 'test-token-64-chars-here-for-testing';

describe('Currencies CRUD API', () =>
{
    let app;
    let db;

    beforeEach(() =>
    {
        // in-memory БД для тестов
        db = initDatabase('test');
        const repo = new CurrencyRepository(db);
        const currencyService = new CurrencyService(repo);
        app = createWebServer(mockLogger, currencyService);
    });

    afterEach(() =>
    {
        if (db && db.open)
        {
            db.close();   // закрываем соединение
        }
    });

    const validToken = 'Bearer test-token-64-chars-here-for-testing';

    test('POST /currencies создаёт валюту', async () =>
    {
        const response = await request(app)
            .post('/currencies')
            .set('Authorization', validToken)
            .send({ name: 'Bitcoin', ticker: 'BTC' });

        expect(response.statusCode).toBe(201);
        expect(response.body).toMatchObject({ name: 'Bitcoin', ticker: 'BTC' });
        expect(response.body.id).toBeDefined();
    });

    test('GET /currencies возвращает список', async () =>
    {
        await request(app)
            .post('/currencies')
            .set('Authorization', validToken)
            .send({ name: 'Ethereum', ticker: 'ETH' });

        const res = await request(app)
            .get('/currencies')
            .set('Authorization', validToken);
        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBeGreaterThan(0);
    });

    test('PUT /currencies/:id обновляет валюту', async () =>
    {
        const createRes = await request(app)
            .post('/currencies')
            .set('Authorization', validToken)
            .send({ name: 'Litecoin', ticker: 'LTC' });
        const id = createRes.body.id;

        const updateRes = await request(app)
            .put(`/currencies/${id}`)
            .set('Authorization', validToken)
            .send({ name: 'Litecoin updated', ticker: 'LTC' });
        expect(updateRes.statusCode).toBe(200);
        expect(updateRes.body.name).toBe('Litecoin updated');
    });

    test('DELETE /currencies/:id удаляет валюту', async () =>
    {
        const createRes = await request(app)
            .post('/currencies')
            .set('Authorization', validToken)
            .send({ name: 'Cardano', ticker: 'ADA' });
        const id = createRes.body.id;

        const delRes = await request(app)
            .delete(`/currencies/${id}`)
            .set('Authorization', validToken);
        expect(delRes.statusCode).toBe(204);

        const getRes = await request(app)
            .get(`/currencies/${id}`)
            .set('Authorization', validToken);
        expect(getRes.statusCode).toBe(404);
    });

    test('отсутствие токена даёт 401', async () =>
    {
        const res = await request(app).get('/currencies');
        expect(res.statusCode).toBe(401);
    });

    test('неверный токен даёт 403', async () =>
    {
        const res = await request(app)
            .get('/currencies')
            .set('Authorization', 'Bearer wrong-token');
        expect(res.statusCode).toBe(403);
    });
});