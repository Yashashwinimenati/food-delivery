const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

class Database {
    constructor() {
        this.db = null;
        this.dbPath = process.env.DB_PATH || './database/food_delivery.db';
    }

    // Initialize database connection
    async init() {
        return new Promise((resolve, reject) => {
            // Ensure database directory exists
            const dbDir = path.dirname(this.dbPath);
            if (!fs.existsSync(dbDir)) {
                fs.mkdirSync(dbDir, { recursive: true });
            }

            this.db = new sqlite3.Database(this.dbPath, (err) => {
                if (err) {
                    console.error('Error opening database:', err.message);
                    reject(err);
                } else {
                    console.log('Connected to SQLite database');
                    resolve();
                }
            });

            // Enable foreign keys
            this.db.run('PRAGMA foreign_keys = ON');
        });
    }

    // Execute a query with parameters
    async run(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.run(sql, params, function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({ id: this.lastID, changes: this.changes });
                }
            });
        });
    }

    // Get a single row
    async get(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.get(sql, params, (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });
    }

    // Get multiple rows
    async all(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.all(sql, params, (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    // Execute multiple statements
    async exec(sql) {
        return new Promise((resolve, reject) => {
            this.db.exec(sql, (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }

    // Close database connection
    async close() {
        return new Promise((resolve, reject) => {
            this.db.close((err) => {
                if (err) {
                    reject(err);
                } else {
                    console.log('Database connection closed');
                    resolve();
                }
            });
        });
    }

    // Initialize database schema
    async initSchema() {
        try {
            const schemaPath = path.join(__dirname, '../../database/schema.sql');
            const schema = fs.readFileSync(schemaPath, 'utf8');
            await this.exec(schema);
            console.log('Database schema initialized successfully');
        } catch (error) {
            console.error('Error initializing schema:', error);
            throw error;
        }
    }

    // Seed database with sample data
    async seedData() {
        try {
            // Check if data already exists
            const userCount = await this.get('SELECT COUNT(*) as count FROM users');
            
            if (userCount.count > 0) {
                console.log('Database already contains data, skipping seeding');
                return;
            }

            const seedPath = path.join(__dirname, '../../database/seeds.sql');
            const seedData = fs.readFileSync(seedPath, 'utf8');
            await this.exec(seedData);
            console.log('Database seeded successfully');
        } catch (error) {
            console.error('Error seeding database:', error);
            throw error;
        }
    }
}

// Create singleton instance
const database = new Database();

module.exports = database; 