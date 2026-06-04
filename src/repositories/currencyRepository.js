class CurrencyRepository 
{
    constructor(db) 
    {
        this.db = db;
    }

    getAll() 
    {
        const stmt = this.db.prepare('SELECT id, name, ticker FROM currencies');
        return stmt.all();
    }

    getById(id) 
    {
        const stmt = this.db.prepare('SELECT id, name, ticker FROM currencies WHERE id = ?');
        return stmt.get(id) || null;
    }

    getByTicker(ticker) 
    {
        const stmt = this.db.prepare('SELECT id, name, ticker FROM currencies WHERE LOWER(ticker) = LOWER(?)');
        return stmt.get(ticker) || null;
    }

    create(name, ticker) 
    {
        const stmt = this.db.prepare('INSERT INTO currencies (name, ticker) VALUES (?, ?)');
        const result = stmt.run(name.trim(), ticker.trim().toUpperCase());
        
        return 
        {
            id: result.lastInsertRowid,
            name: name.trim(),
            ticker: ticker.trim().toUpperCase()
        };
    }

    update(id, name, ticker) 
    {
        const stmt = this.db.prepare('UPDATE currencies SET name = ?, ticker = ? WHERE id = ?');
        const result = stmt.run(name.trim(), ticker.trim().toUpperCase(), id);

        if (result.changes === 0) return null;

        return 
        {
            id,
            name: name.trim(),
            ticker: ticker.trim().toUpperCase()
        };
    }

    delete(id) 
    {
        const stmt = this.db.prepare('DELETE FROM currencies WHERE id = ?');
        const result = stmt.run(id);
        
        return result.changes > 0;
    }
}

module.exports = CurrencyRepository;