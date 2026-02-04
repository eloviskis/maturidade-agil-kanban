const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const DATABASE_URL = 'postgresql://neondb_owner:npg_UpEy8QmVNL7H@ep-steep-credit-ahk50ent-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require';

async function setupDatabase() {
    const client = new Client({
        connectionString: DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        console.log('🔌 Conectando ao Neon...');
        await client.connect();
        console.log('✅ Conectado com sucesso!');

        const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
        
        console.log('📊 Executando schema...');
        await client.query(schema);
        console.log('✅ Banco de dados configurado com sucesso!');
        console.log('');
        console.log('📋 O que foi criado:');
        console.log('  - 5 tabelas (teams, users, evaluation_cycles, evaluations, evaluation_answers)');
        console.log('  - 9 times pré-cadastrados');
        console.log('  - 1 ciclo ativo (Q4 2025)');
        console.log('  - 1 usuário admin (email: admin@example.com, senha: admin123)');

    } catch (error) {
        console.error('❌ Erro:', error.message);
        process.exit(1);
    } finally {
        await client.end();
    }
}

setupDatabase();
