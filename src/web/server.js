const axios = require('axios');
const express = require('express');
const authMiddleware = require('./authMiddleware');
const CurrencyService = require('../services/currencyService');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const path = require('path');
const swaggerDocument = YAML.load(path.join(__dirname, '../../openapi.yaml'));

function createWebServer(logger)
{
    const app = express();
    const currencyService = new CurrencyService();

    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

    // Middleware для парсинга JSON
    app.use(express.json());

    // Логирование запросов (опционально)
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

    app.get('/price', async (req, res) =>
    {
        const { currency } = req.query;

        if (!currency)
        {
            return res.status(400).json({ error: 'currency query parameter is required' });
        }

        // Проверяем, есть ли такая валюта в локальном хранилище
        const existingCurrency = currencyService.getByTicker(currency);

        if (!existingCurrency)
        {
            return res.status(404).json({ error: `Currency ${currency} not found in local storage` });
        }

        try
        {
            // Запрос к Binance Public API
            const response = await axios.get('https://api.binance.com/api/v3/ticker/price', { timeout: 5000, });
            const allPrices = response.data;
            const filtered = allPrices.filter(p => p.symbol.includes(currency.toUpperCase()));

            if (filtered.length === 0) {
                return res.status(404).json({ error: `No trading pairs found for ${currency}` });
            }

            // Форматируем ответ
            res.json({
                currency: existingCurrency,
                prices: filtered.map(p => ({ pair: p.symbol, price: p.price }))
            });
        }
        catch (error)
        {
            logger.error('Binance API error', { error: error.message });
            res.status(502).json({ error: 'Failed to fetch prices from Binance' });
        }
    });

    const currencyRouter = express.Router();
    currencyRouter.use(authMiddleware); // все маршруты ниже защищены

    // GET /currencies
    currencyRouter.get('/', (req, res) =>
    {
        const currencies = currencyService.getAll();
        res.json(currencies);
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

    // 404
    app.use((req, res) =>
    {
        res.status(404).json({ error: 'Not found' });
    });

    return app;
}

function startWebServer(app, port, logger)
{
    const server = app.listen(port, () =>
    {
        logger.info(`Web server listening on port ${port}`);
    });
    return server;
}

module.exports = { createWebServer, startWebServer };