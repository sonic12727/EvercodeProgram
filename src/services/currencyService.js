class CurrencyService 
{
  constructor() 
  {
    this.currencies = []; // { id, name, ticker }
    this.nextId = 1;
  }

  getAll() 
  {
    return this.currencies;
  }

  getById(id) 
  {
    return this.currencies.find(c => c.id === id);
  }

  getByTicker(ticker) 
  {
    return this.currencies.find(c => c.ticker.toLowerCase() === ticker.toLowerCase());
  }

  create(name, ticker) 
  {
    const newCurrency = 
    {
      id: this.nextId++,
      name: name.trim(),
      ticker: ticker.trim().toUpperCase()
    };
    this.currencies.push(newCurrency);

    return newCurrency;
  }

  update(id, name, ticker) 
  {
    const index = this.currencies.findIndex(c => c.id === id);

    if (index === -1) return null;
    this.currencies[index] = 
    {
      ...this.currencies[index],
      name: name.trim(),
      ticker: ticker.trim().toUpperCase()
    };
    return this.currencies[index];
  }

  delete(id) 
  {
    const index = this.currencies.findIndex(c => c.id === id);

    if (index === -1) return false;
    this.currencies.splice(index, 1);
    return true;
  }
}

module.exports = CurrencyService;