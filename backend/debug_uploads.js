const { Sequelize, DataTypes } = require('sequelize');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

// Setup Sequelize connection (adjust config as needed based on your config/config.json or .env)
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, 'database.sqlite'), // Assuming sqlite based on previous context, or use env vars
    logging: false
});

const run = async () => {
    try {
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');

        // Raw query to check table structure (for SQLite)
        const tableInfo = await sequelize.query("PRAGMA table_info(Uploads);");
        console.log('\nTable Structure (Uploads):');
        tableInfo[0].forEach(col => {
            console.log(`- ${col.name} (${col.type})`);
        });

        // Check for status column specifically
        const hasStatus = tableInfo[0].some(col => col.name === 'status');
        console.log(`\nHas 'status' column: ${hasStatus}`);

        if (!hasStatus) {
            console.log('CRITICAL: status column is missing! This explains why updates fail.');
        }

        // Get latest uploads
        const uploads = await sequelize.query("SELECT * FROM Uploads ORDER BY createdAt DESC LIMIT 5", { type: Sequelize.QueryTypes.SELECT });
        console.log('\nLatest 5 Uploads:');
        uploads.forEach(u => {
            console.log(`ID: ${u.id} | Type: ${u.type} | Status: ${u.status} | ReviewedBy: ${u.reviewedBy}`);
        });

    } catch (error) {
        console.error('Unable to connect to the database:', error);
    } finally {
        await sequelize.close();
    }
};

run();
