const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

(async () => {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASS || 'xxxxxx',
            multipleStatements: true
        });

        const schemaPath = path.join(__dirname, '../database/schema.sql');
        const sql = fs.readFileSync(schemaPath, 'utf8');

        const statements = sql.split(';').map(s => s.trim()).filter(s => s);
        for (let stmt of statements) {
            if (stmt) await connection.query(stmt);
        }

        console.log("Database initialized successfully!");
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
})();
