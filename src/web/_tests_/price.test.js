const request = require('supertest');
const { createWebServer } = require('../server');

// Мокаем axios до импорта сервера
jest.mock('axios');
const axios = require('axios');

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

    beforeEach(() =>
    {
        const CurrencyService = require('../src/services/currencyService');
        const currencyService = new CurrencyService();
        app = createWebServer(mockLogger, currencyService);
        jest.clearAllMocks();
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
        await request(app).post('/currencies').set('Authorization', token).send({ name: 'Bitcoin', ticker: 'BTC' });

        const mockBinanceResponse =
        {
            data: [
                { symbol: 'BTCUSDT', price: '50000.00' },
                { symbol: 'ETHBTC', price: '0.07' },
                { symbol: 'BNBBTC', price: '0.005' }
            ]
        };
        axios.get.mockResolvedValue(mockBinanceResponse);

        const res = await request(app).get('/price?currency=BTC');
        expect(res.statusCode).toBe(200);
        expect(res.body.currency.ticker).toBe('BTC');
        expect(res.body.prices).toHaveLength(3);
        expect(res.body.prices[0]).toHaveProperty('pair', 'BTCUSDT');
        expect(axios.get).toHaveBeenCalledWith(
            'https://api.binance.com/api/v3/ticker/price',
            expect.objectContaining({ timeout: 5000 })
        );
    });

    test('обрабатывает ошибку Binance API', async () =>
    {
        // Создаём валюту
        const token = 'Bearer test-token-64-chars-here-for-testing';
        await request(app).post('/currencies').set('Authorization', token).send({ name: 'Ethereum', ticker: 'ETH' });

        // Мокаем ошибку сети / API
        axios.get.mockRejectedValue(new Error('Network error'));

        const res = await request(app).get('/price?currency=ETH');
        expect(res.statusCode).toBe(502);
        expect(res.body.error).toContain('Binance API error');
    });
});