const axios = require('axios');
const express = require('express');
const authMiddleware = require('./authMiddleware');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const path = require('path');
const swaggerDocument = YAML.load(path.join(__dirname, '../../openapi.yaml'));

// Передаем currencyService извне, чтобы все роуты и тесты работали со сквозными данными
function createWebServer(logger, currencyService)
{
    const app = express();

    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

    // Middleware для парсинга JSON
    app.use(express.json());

    // Логирование запросов
    app.use((req, res, next) =>
    {
        logger.debug(`${req.method} ${req.url}`);
        next();
    });

    // Публичный маршрут /status
    app.get('/status', (req, res) =>
    {
        logger.info('Health check');
        res.status(200).send('ok');
    });

    // Публичный маршрут /price
    app.get('/price', async (req, res) =>
    {
        const { currency } = req.query;

        if (!currency)
        {
            return res.status(400).json({ error: 'currency query parameter is required' });
        }

        // Проверяем наличие валюты в локальной базе через внедренный сервис
        const localCurrency = currencyService.getByTicker(currency);

        if (!localCurrency)
        {
            return res.status(404).json({ error: `Currency with ticker ${currency} not found in local database` });
        }

        try
        {
            const response = await axios.get('https://api.binance.com/api/v3/ticker/price', { timeout: 5000 });
            const allPrices = response.data;
            const searchTicker = currency.toUpperCase();
            const filtered = allPrices.filter(p => p.symbol.startsWith(searchTicker) || p.symbol.endsWith(searchTicker));

            res.json({
                currency: localCurrency,
                prices: filtered.map(p => ({
                    pair: p.symbol,
                    price: p.price
                }))
            });
        }
        catch (error)
        {
            logger.error('Binance API integration error', { error: error.message, stack: error.stack });
            res.status(502).json({ error: 'Failed to fetch prices from Binance API' });
        }
    });

    // Маршруты CRUD для валют (Защищены authMiddleware)
    const currencyRouter = express.Router();
    currencyRouter.use(authMiddleware);

    // GET /currencies
    currencyRouter.get('/', (req, res) =>
    {
        res.json(currencyService.getAll());
    });

    // GET /currencies/:id
    currencyRouter.get('/:id', (req, res) =>
    {
        const id = parseInt(req.params.id);
        const currency = currencyService.getById(id);

        if (!currency)
        {
            return res.status(404).json({ error: 'Currency not found' });
        }
        res.json(currency);
    });

    // POST /currencies
    currencyRouter.post('/', (req, res) =>
    {
        const { name, ticker } = req.body;

        if (!name || !ticker)
        {
            return res.status(400).json({ error: 'name and ticker are required' });
        }
        const newCurrency = currencyService.create(name, ticker);
        res.status(201).json(newCurrency);
    });

    // PUT /currencies/:id
    currencyRouter.put('/:id', (req, res) =>
    {
        const id = parseInt(req.params.id);
        const { name, ticker } = req.body;

        if (!name || !ticker)
        {
            return res.status(400).json({ error: 'name and ticker are required' });
        }
        const updated = currencyService.update(id, name, ticker);

        if (!updated)
        {
            return res.status(404).json({ error: 'Currency not found' });
        }
        res.json(updated);
    });

    // DELETE /currencies/:id
    currencyRouter.delete('/:id', (req, res) =>
    {
        const id = parseInt(req.params.id);
        const deleted = currencyService.delete(id);

        if (!deleted)
        {
            return res.status(404).json({ error: 'Currency not found' });
        }
        res.status(204).send();
    });

    app.use('/currencies', currencyRouter);

    // 404 handler
    app.use((req, res) =>
    {
        res.status(404).json({ error: 'Not found' });
    });

    return app;
}

module.exports = { createWebServer };