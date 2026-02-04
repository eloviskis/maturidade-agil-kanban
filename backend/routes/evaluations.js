const express = require('express');
const router = express.Router();
const db = require('../db');

// Criar nova avaliação
router.post('/', async (req, res) => {
    const client = await db.pool.connect();
    
    try {
        const { team_id, user_id, cycle_id, evaluation_type, answers } = req.body;
        
        // Validação
        if (!team_id || !user_id || !cycle_id || !answers) {
            return res.status(400).json({ error: 'Dados incompletos' });
        }
        
        const evalType = evaluation_type || 'kanban';
        const maxQuestions = evalType === 'kanban' ? 24 : 40;
        
        await client.query('BEGIN');
        
        // Inserir avaliação
        const evalResult = await client.query(
            'INSERT INTO evaluations (team_id, user_id, cycle_id, evaluation_type) VALUES ($1, $2, $3, $4) RETURNING id',
            [team_id, user_id, cycle_id, evalType]
        );
        
        const evaluationId = evalResult.rows[0].id;
        
        // Inserir respostas
        for (let i = 1; i <= maxQuestions; i++) {
            const questionKey = `q${i}`;
            if (answers[questionKey]) {
                await client.query(
                    'INSERT INTO evaluation_answers (evaluation_id, question_number, answer_value) VALUES ($1, $2, $3)',
                    [evaluationId, i, answers[questionKey]]
                );
            }
        }
        
        await client.query('COMMIT');
        
        res.status(201).json({ 
            message: 'Avaliação salva com sucesso!',
            evaluationId 
        });
        
    } catch (error) {
        await client.query('ROLLBACK');
        res.status(500).json({ error: error.message });
    } finally {
        client.release();
    }
});

// Listar avaliações de um time
router.get('/team/:teamId', async (req, res) => {
    try {
        const { teamId } = req.params;
        const { cycleId } = req.query;
        
        let query = `
            SELECT 
                e.id,
                e.created_at,
                u.name as evaluator_name,
                t.name as team_name,
                ec.name as cycle_name
            FROM evaluations e
            JOIN users u ON e.user_id = u.id
            JOIN teams t ON e.team_id = t.id
            JOIN evaluation_cycles ec ON e.cycle_id = ec.id
            WHERE e.team_id = $1
        `;
        
        const params = [teamId];
        
        if (cycleId) {
            query += ' AND e.cycle_id = $2';
            params.push(cycleId);
        }
        
        query += ' ORDER BY e.created_at DESC';
        
        const result = await db.query(query, params);
        res.json(result.rows);
        
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Buscar detalhes de uma avaliação específica
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        // Buscar avaliação
        const evalResult = await db.query(`
            SELECT 
                e.*,
                u.name as evaluator_name,
                t.name as team_name,
                ec.name as cycle_name
            FROM evaluations e
            JOIN users u ON e.user_id = u.id
            JOIN teams t ON e.team_id = t.id
            JOIN evaluation_cycles ec ON e.cycle_id = ec.id
            WHERE e.id = $1
        `, [id]);
        
        if (evalResult.rows.length === 0) {
            return res.status(404).json({ error: 'Avaliação não encontrada' });
        }
        
        // Buscar respostas
        const answersResult = await db.query(
            'SELECT question_number, answer_value FROM evaluation_answers WHERE evaluation_id = $1 ORDER BY question_number',
            [id]
        );
        
        const evaluation = evalResult.rows[0];
        evaluation.answers = {};
        
        answersResult.rows.forEach(row => {
            evaluation.answers[`q${row.question_number}`] = row.answer_value;
        });
        
        res.json(evaluation);
        
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Deletar avaliação
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        const result = await db.query(
            'DELETE FROM evaluations WHERE id = $1 RETURNING *',
            [id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Avaliação não encontrada' });
        }
        
        res.json({ message: 'Avaliação deletada com sucesso' });
        
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
