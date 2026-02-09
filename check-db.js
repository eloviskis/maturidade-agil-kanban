// Script para verificar banco de dados
require('dotenv').config();
const { Pool } = require('pg');

// Use a connection string do Vercel/Neon
const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;

console.log('🔍 Verificando banco de dados...\n');
console.log('Connection string:', connectionString ? 'Configurada ✅' : 'NÃO ENCONTRADA ❌');

if (!connectionString) {
    console.log('\n❌ Adicione DATABASE_URL no arquivo .env com a connection string do Neon');
    process.exit(1);
}

const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false }
});

async function checkDatabase() {
    try {
        // Teste de conexão
        console.log('\n📡 Testando conexão...');
        await pool.query('SELECT NOW()');
        console.log('✅ Conexão OK!\n');

        // Verificar tabelas
        console.log('📋 Verificando tabelas...');
        const tablesResult = await pool.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
            ORDER BY table_name
        `);
        
        if (tablesResult.rows.length === 0) {
            console.log('❌ NENHUMA TABELA ENCONTRADA!');
            console.log('   Execute o arquivo schema.sql no banco de dados.\n');
        } else {
            console.log('✅ Tabelas encontradas:');
            tablesResult.rows.forEach(row => {
                console.log(`   - ${row.table_name}`);
            });
            console.log('');
        }

        // Verificar times
        console.log('🏢 Verificando times...');
        const teamsResult = await pool.query('SELECT COUNT(*) as total FROM teams');
        console.log(`✅ ${teamsResult.rows[0].total} times cadastrados\n`);

        if (teamsResult.rows[0].total > 0) {
            const teamsList = await pool.query('SELECT id, name FROM teams ORDER BY name');
            teamsList.rows.forEach(team => {
                console.log(`   ${team.id}. ${team.name}`);
            });
            console.log('');
        }

        // Verificar usuário admin
        console.log('👤 Verificando usuário admin...');
        const adminResult = await pool.query(`
            SELECT id, name, email, role 
            FROM users 
            WHERE role = 'admin'
        `);
        
        if (adminResult.rows.length === 0) {
            console.log('❌ Usuário admin NÃO ENCONTRADO!');
            console.log('   Execute o arquivo schema.sql para criar.\n');
        } else {
            console.log('✅ Usuário admin encontrado:');
            adminResult.rows.forEach(user => {
                console.log(`   Email: ${user.email}`);
                console.log(`   Nome: ${user.name}\n`);
            });
        }

        // Verificar ciclos
        console.log('📅 Verificando ciclos...');
        const cyclesResult = await pool.query('SELECT COUNT(*) as total FROM evaluation_cycles');
        console.log(`✅ ${cyclesResult.rows[0].total} ciclos cadastrados\n`);

        // Verificar avaliações
        console.log('📝 Verificando avaliações...');
        const evalsResult = await pool.query('SELECT COUNT(*) as total FROM evaluations');
        console.log(`✅ ${evalsResult.rows[0].total} avaliações registradas\n`);

        console.log('✅ Verificação concluída com sucesso!');

    } catch (error) {
        console.error('\n❌ ERRO:', error.message);
        
        if (error.message.includes('relation') && error.message.includes('does not exist')) {
            console.log('\n💡 As tabelas não existem no banco.');
            console.log('   Execute o arquivo schema.sql no Neon SQL Editor.\n');
        }
    } finally {
        await pool.end();
    }
}

checkDatabase();
