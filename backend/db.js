const mysql = require('mysql2');
require('dotenv').config();

// Create MySQL connection pool
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root',
    database: process.env.DB_NAME || 'bookmycampus',
    socketPath: process.env.DB_SOCKET_PATH || undefined, // For Google Cloud SQL
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0
});

// Test connection
pool.getConnection((err, connection) => {
    if (err) {
        console.error('❌ Error connecting to database:', err.message);
        return;
    }
    console.log('✅ Connected to MySQL database');
    connection.release();
});

module.exports = pool.promise();