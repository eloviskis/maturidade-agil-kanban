// Atualizar senha admin no banco Neon
require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function updateAdmin() {
    try {
        console.log('🔧 Atualizando senha do admin no banco Neon...\n');
        
        // Hash correto da senha Pwk8q12v@
        const correctHash = '$2a$10$Ac9xIhn58jotFVwkzFEbJe3Ol5cdaHcj3txayaRCrCtLE0/2iCwGy';
        
        await pool.query(`
            UPDATE users 
            SET password_hash = $1
            WHERE email = 'admin@example.com'
        `, [correctHash]);
        
        console.log('✅ Senha atualizada com sucesso no banco Neon!');
        console.log('   Email: admin@example.com');
        console.log('   Senha: Pwk8q12v@\n');
        
        console.log('✅ Agora o login funcionará tanto localmente quanto no Vercel!\n');
        
    } catch (error) {
        console.error('❌ Erro:', error.message);
    } finally {
        await pool.end();
    }
}

updateAdmin();
