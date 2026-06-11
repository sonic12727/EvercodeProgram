class CurrencyService
{
    constructor(currencyRepository)
    {
        this.currencyRepository = currencyRepository;
        this.prices = {};
    }

    getAll() { return this.currencyRepository.getAll(); }
    getById(id) { return this.currencyRepository.getById(id); }
    getByTicker(ticker) { return this.currencyRepository.getByTicker(ticker); }
    create(name, ticker) { return this.currencyRepository.create(name, ticker); }
    update(id, name, ticker) { return this.currencyRepository.update(id, name, ticker); }
    delete(id) { return this.currencyRepository.delete(id); }

    updatePrices(ticker, pricesList)
    {
        this.prices[ticker.toUpperCase()] = pricesList;
    }

    getPrices(ticker) {
        return this.prices[ticker.toUpperCase()] || [];
    }
}

module.exports = CurrencyService;