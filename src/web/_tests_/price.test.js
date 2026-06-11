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

describe('GET /price', () =>
{
    let app;
    let db;
    let currencyService;

    beforeEach(() =>
    {
        db = initDatabase('test');
        const repo = new CurrencyRepository(db);
        currencyService = new CurrencyService(repo);
        app = createWebServer(mockLogger, currencyService);
    });

    afterEach(() =>
    {
        if (db && db.open) db.close();
    });

    test('возвращает 400 если отсутствует параметр currency', async () =>
    {
        const res = await request(app).get('/price');
        expect(res.statusCode).toBe(400);
        expect(res.body.error).toContain('currency query parameter');
    });

    test('возвращает 404 если валюты нет в локальной базе', async () =>
    {
        const res = await request(app).get('/price?currency=FAKE');
        expect(res.statusCode).toBe(404);
        expect(res.body.error).toContain('not found');
    });

    test('возвращает цены для существующей валюты', async () =>
    {
        const token = 'Bearer test-token-64-chars-here-for-testing';
        await request(app)
            .post('/currencies')
            .set('Authorization', token)
            .send({ name: 'Bitcoin', ticker: 'BTC' });

        // 2. Ручное заполнение кэша цен
        const mockPrices = [
            { pair: 'BTCUSDT', price: '50000.00' },
            { pair: 'ETHBTC', price: '0.07' },
            { pair: 'BNBBTC', price: '0.005' }
        ];
        currencyService.updatePrices('BTC', mockPrices);

        // 3. Запрос /price
        const res = await request(app).get('/price?currency=BTC');
        expect(res.statusCode).toBe(200);
        expect(res.body.currency.ticker).toBe('BTC');
        expect(res.body.prices).toHaveLength(3);
        expect(res.body.prices[0]).toHaveProperty('pair', 'BTCUSDT');
        expect(res.body.prices[0]).toHaveProperty('price', '50000.00');
    });

    test('обрабатывает отсутствие цен в кэше', async () =>
    {
        const token = 'Bearer test-token-64-chars-here-for-testing';
        await request(app)
            .post('/currencies')
            .set('Authorization', token)
            .send({ name: 'Ethereum', ticker: 'ETH' });
        const res = await request(app).get('/price?currency=ETH');
        expect(res.statusCode).toBe(200);
        expect(res.body.prices).toEqual([]);
    });
});