const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'grocery_inventory',
    port: 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

pool.getConnection()
    .then(conn => {
        console.log('✅ MySQL Connected');
        conn.release();
    })
    .catch(err => {
        console.error('❌ MySQL Error:', err.message);
        process.exit(1);
    });

module.exports = pool;