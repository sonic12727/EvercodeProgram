const Database = require('better-sqlite3');
const path = require('path');

function initDatabase(environment = 'development') 
{
    // Для тестов используем БД в памяти, для разработки - файл на диске
    const dbPath = environment === 'test' ? ':memory:' : path.join(__dirname, '../../database.sqlite');

    const db = new Database(dbPath, { verbose: null });

    // Включаем поддержку внешних ключей и оптимизацию WAL
    db.pragma('foreign_keys = ON');
    db.pragma('journal_mode = WAL');

    // Создаем схему данных (Таблица валют)
    db.prepare(`
        CREATE TABLE IF NOT EXISTS currencies (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            ticker TEXT NOT NULL UNIQUE
        )
    `).run();

    return db;
}

module.exports = initDatabase;