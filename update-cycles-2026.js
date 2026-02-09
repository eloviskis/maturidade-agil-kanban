// Atualizar ciclos para 2026
require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function updateCycles() {
    try {
        console.log('📅 Verificando ciclos atuais...\n');
        
        // Ver ciclos existentes
        const current = await pool.query('SELECT * FROM evaluation_cycles ORDER BY start_date');
        console.log('Ciclos atuais:');
        current.rows.forEach(c => {
            console.log(`   ID ${c.id}: ${c.name} (${c.start_date} a ${c.end_date}) ${c.is_active ? '✅ Ativo' : ''}`);
        });
        console.log('');
        
        // Desativar ciclos antigos
        console.log('🔄 Desativando ciclos de 2025...');
        await pool.query(`UPDATE evaluation_cycles SET is_active = false WHERE name LIKE '%2025%'`);
        console.log('✅ Ciclos 2025 desativados\n');
        
        // Adicionar ciclos 2026
        console.log('➕ Adicionando ciclos de 2026...\n');
        
        const cycles2026 = [
            { name: 'Q1 2026', start: '2026-01-01', end: '2026-03-31', desc: 'Primeiro trimestre de 2026' },
            { name: 'Q2 2026', start: '2026-04-01', end: '2026-06-30', desc: 'Segundo trimestre de 2026' },
            { name: 'Q3 2026', start: '2026-07-01', end: '2026-09-30', desc: 'Terceiro trimestre de 2026' },
            { name: 'Q4 2026', start: '2026-10-01', end: '2026-12-31', desc: 'Quarto trimestre de 2026' }
        ];
        
        for (const cycle of cycles2026) {
            await pool.query(`
                INSERT INTO evaluation_cycles (name, start_date, end_date, description, is_active)
                VALUES ($1, $2, $3, $4, true)
                ON CONFLICT DO NOTHING
            `, [cycle.name, cycle.start, cycle.end, cycle.desc]);
            console.log(`   ✅ ${cycle.name}`);
        }
        
        // Ativar Q1 2026 como padrão
        console.log('\n🎯 Definindo Q1 2026 como ciclo ativo...');
        await pool.query(`UPDATE evaluation_cycles SET is_active = true WHERE name = 'Q1 2026'`);
        
        console.log('\n📅 Ciclos finais:');
        const final = await pool.query('SELECT * FROM evaluation_cycles ORDER BY start_date DESC');
        final.rows.forEach(c => {
            console.log(`   ID ${c.id}: ${c.name} ${c.is_active ? '✅ ATIVO' : ''}`);
        });
        
        console.log('\n✅ Ciclos atualizados para 2026!');
        
    } catch (error) {
        console.error('❌ Erro:', error.message);
    } finally {
        await pool.end();
    }
}

updateCycles();
