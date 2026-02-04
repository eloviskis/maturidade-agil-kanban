const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD
});

async function initializeDatabase() {
    try {
        console.log('🔄 Conectando ao banco de dados...');
        
        // Ler o arquivo SQL
        const schemaPath = path.join(__dirname, 'schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');
        
        console.log('📝 Executando script SQL...');
        await pool.query(schema);
        
        console.log('✅ Banco de dados inicializado com sucesso!');
        console.log('📊 Tabelas criadas e dados iniciais inseridos.');
        
    } catch (error) {
        console.error('❌ Erro ao inicializar banco de dados:', error);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

initializeDatabase();
