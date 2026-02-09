// Verificar e adicionar coluna evaluation_type
require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function fixEvaluationsTable() {
    try {
        console.log('🔍 Verificando estrutura da tabela evaluations...\n');
        
        // Verificar colunas existentes
        const columns = await pool.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'evaluations'
            ORDER BY ordinal_position
        `);
        
        console.log('📋 Colunas atuais:');
        columns.rows.forEach(col => {
            console.log(`   - ${col.column_name} (${col.data_type})`);
        });
        console.log('');
        
        // Verificar se evaluation_type existe
        const hasType = columns.rows.some(col => col.column_name === 'evaluation_type');
        
        if (!hasType) {
            console.log('⚠️  Coluna evaluation_type NÃO EXISTE!');
            console.log('✅ Adicionando coluna...\n');
            
            await pool.query(`
                ALTER TABLE evaluations 
                ADD COLUMN evaluation_type VARCHAR(20) DEFAULT 'kanban'
            `);
            
            console.log('✅ Coluna evaluation_type adicionada com sucesso!');
            console.log('   Tipo: VARCHAR(20)');
            console.log('   Default: kanban\n');
        } else {
            console.log('✅ Coluna evaluation_type já existe!\n');
        }
        
        // Verificar novamente
        const newColumns = await pool.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'evaluations'
            ORDER BY ordinal_position
        `);
        
        console.log('📋 Colunas após correção:');
        newColumns.rows.forEach(col => {
            console.log(`   - ${col.column_name} (${col.data_type})`);
        });
        
    } catch (error) {
        console.error('❌ Erro:', error.message);
    } finally {
        await pool.end();
    }
}

fixEvaluationsTable();
