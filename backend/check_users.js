const mysql = require('mysql2');
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3307,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root',
    database: process.env.DB_NAME || 'bookmycampus',
    waitForConnections: true,
    connectionLimit: 1,
    queueLimit: 0
});

const promisePool = pool.promise();

async function check() {
    try {
        const [rows] = await promisePool.query('SELECT id, name, email, role FROM users');
        console.log('Users:', rows);
        process.exit(0);
    } catch (err) {
        console.error('Error:', err.message);
        process.exit(1);
    }
}

check();
