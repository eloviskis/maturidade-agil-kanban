// Script para verificar e testar usuário admin
require('dotenv').config();
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function checkAdmin() {
    try {
        // Buscar usuário admin
        console.log('🔍 Buscando usuário admin...\n');
        const result = await pool.query(`
            SELECT id, name, email, password_hash, role 
            FROM users 
            WHERE email = 'admin@example.com'
        `);

        if (result.rows.length === 0) {
            console.log('❌ Usuário admin não encontrado!');
            console.log('   Criando agora...\n');
            
            const hash = await bcrypt.hash('Pwk8q12v@', 10);
            await pool.query(`
                INSERT INTO users (name, email, password_hash, role)
                VALUES ('Administrador', 'admin@example.com', $1, 'admin')
            `, [hash]);
            
            console.log('✅ Usuário admin criado com sucesso!');
            return;
        }

        const user = result.rows[0];
        console.log('✅ Usuário encontrado:');
        console.log(`   ID: ${user.id}`);
        console.log(`   Nome: ${user.name}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Role: ${user.role}`);
        console.log(`   Hash senha: ${user.password_hash}\n`);

        // Testar senha
        console.log('🔑 Testando senha "Pwk8q12v@"...');
        const valid = await bcrypt.compare('Pwk8q12v@', user.password_hash);
        
        if (valid) {
            console.log('✅ Senha CORRETA! Login deve funcionar.\n');
        } else {
            console.log('❌ Senha INCORRETA! Atualizando...\n');
            
            const newHash = await bcrypt.hash('Pwk8q12v@', 10);
            await pool.query(`
                UPDATE users 
                SET password_hash = $1 
                WHERE email = 'admin@example.com'
            `, [newHash]);
            
            console.log('✅ Senha atualizada com sucesso!');
            console.log(`   Novo hash: ${newHash}\n`);
        }

    } catch (error) {
        console.error('❌ Erro:', error.message);
    } finally {
        await pool.end();
    }
}

checkAdmin();
