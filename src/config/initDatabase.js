require('dotenv').config();
const database = require('./database');

async function initDatabase() {
    try {
        console.log('Initializing database...');
        
        // Initialize database connection
        await database.init();
        
        // Initialize schema
        await database.initSchema();
        
        // Seed data
        await database.seedData();
        
        console.log('Database initialization completed successfully!');
        
        // Only close connection if this file is run directly
        if (require.main === module) {
            await database.close();
            process.exit(0);
        }
    } catch (error) {
        console.error('Database initialization failed:', error);
        if (require.main === module) {
            process.exit(1);
        } else {
            throw error;
        }
    }
}

// Run if this file is executed directly
if (require.main === module) {
    initDatabase();
}

module.exports = initDatabase; 