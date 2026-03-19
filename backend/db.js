const { Pool } = require('pg');
require('dotenv').config();

const sslConfig = process.env.DB_SSL === 'false'
    ? false
    : process.env.NODE_ENV === 'production'
        ? { rejectUnauthorized: false }
        : false;

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: sslConfig
});

pool.on('error', (err) => {
    console.error('Erro inesperado no cliente PostgreSQL', err);
});

module.exports = {
    query: (text, params) => pool.query(text, params),
    pool
};
