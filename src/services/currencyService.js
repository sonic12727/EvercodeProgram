class CurrencyService
{
    constructor(currencyRepository)
    {
        this.currencyRepository = currencyRepository;
    }

    getAll()
    {
        return this.currencyRepository.getAll();
    }

    getById(id)
    {
        return this.currencyRepository.getById(id);
    }

    getByTicker(ticker)
    {
        return this.currencyRepository.getByTicker(ticker);
    }

    create(name, ticker)
    {
        return this.currencyRepository.create(name, ticker);
    }

    update(id, name, ticker)
    {
        return this.currencyRepository.update(id, name, ticker);
    }

    delete(id)
    {
        return this.currencyRepository.delete(id);
    }
}

module.exports = CurrencyService;