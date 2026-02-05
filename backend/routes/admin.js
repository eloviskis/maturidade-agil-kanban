const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Middleware de autenticação admin
const requireAdmin = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ error: 'Token não fornecido' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'sua-chave-secreta-aqui');
        
        const result = await req.db.query(
            'SELECT id, email, role FROM users WHERE id = $1 AND role = $2',
            [decoded.userId, 'admin']
        );

        if (result.rows.length === 0) {
            return res.status(403).json({ error: 'Acesso negado. Apenas administradores.' });
        }

        req.user = result.rows[0];
        next();
    } catch (error) {
        console.error('Erro na autenticação admin:', error);
        return res.status(401).json({ error: 'Token inválido' });
    }
};

// Login Admin
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Buscar usuário admin
        const result = await req.db.query(
            'SELECT id, email, password_hash, role, name FROM users WHERE email = $1 AND role = $2',
            [email, 'admin']
        );

        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Credenciais inválidas' });
        }

        const user = result.rows[0];

        // Verificar senha
        const validPassword = await bcrypt.compare(password, user.password_hash);
        if (!validPassword) {
            return res.status(401).json({ error: 'Credenciais inválidas' });
        }

        // Gerar token
        const token = jwt.sign(
            { userId: user.id, role: user.role },
            process.env.JWT_SECRET || 'sua-chave-secreta-aqui',
            { expiresIn: '24h' }
        );

        res.json({
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Erro no login admin:', error);
        res.status(500).json({ error: 'Erro no servidor' });
    }
});

// Listar todas as avaliações (com detalhes)
router.get('/evaluations', requireAdmin, async (req, res) => {
    try {
        const result = await req.db.query(`
            SELECT 
                e.id,
                e.evaluation_type,
                e.created_at,
                t.name as team_name,
                u.name as user_name,
                u.email as user_email,
                ec.name as cycle_name,
                COUNT(ea.id) as answers_count
            FROM evaluations e
            JOIN teams t ON e.team_id = t.id
            JOIN users u ON e.user_id = u.id
            JOIN evaluation_cycles ec ON e.cycle_id = ec.id
            LEFT JOIN evaluation_answers ea ON e.id = ea.evaluation_id
            GROUP BY e.id, t.name, u.name, u.email, ec.name
            ORDER BY e.created_at DESC
        `);

        res.json(result.rows);
    } catch (error) {
        console.error('Erro ao listar avaliações:', error);
        res.status(500).json({ error: 'Erro ao listar avaliações' });
    }
});

// Deletar avaliação específica
router.delete('/evaluations/:id', requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;

        // Verificar se existe
        const check = await req.db.query('SELECT id FROM evaluations WHERE id = $1', [id]);
        if (check.rows.length === 0) {
            return res.status(404).json({ error: 'Avaliação não encontrada' });
        }

        // Deletar (cascade vai deletar as respostas também)
        await req.db.query('DELETE FROM evaluations WHERE id = $1', [id]);

        res.json({ message: 'Avaliação deletada com sucesso' });
    } catch (error) {
        console.error('Erro ao deletar avaliação:', error);
        res.status(500).json({ error: 'Erro ao deletar avaliação' });
    }
});

// Zerar todas as avaliações
router.delete('/evaluations', requireAdmin, async (req, res) => {
    try {
        // Primeiro deletar respostas, depois avaliações
        await req.db.query('DELETE FROM evaluation_answers');
        await req.db.query('DELETE FROM evaluations');

        res.json({ message: 'Todas as avaliações foram deletadas com sucesso' });
    } catch (error) {
        console.error('Erro ao zerar avaliações:', error);
        res.status(500).json({ error: 'Erro ao zerar avaliações' });
    }
});

// Relatório de participação (quem avaliou e quem não)
router.get('/participation/:teamId/:cycleId', requireAdmin, async (req, res) => {
    try {
        const { teamId, cycleId } = req.params;
        const { type } = req.query; // 'kanban' ou 'jornada'

        // Buscar avaliações do time/ciclo
        const evaluationsResult = await req.db.query(`
            SELECT 
                e.id,
                e.evaluation_type,
                e.created_at,
                u.name as evaluator_name,
                u.email as evaluator_email,
                COUNT(ea.id) as answers_count
            FROM evaluations e
            JOIN users u ON e.user_id = u.id
            LEFT JOIN evaluation_answers ea ON e.id = ea.evaluation_id
            WHERE e.team_id = $1 AND e.cycle_id = $2
            ${type ? 'AND e.evaluation_type = $3' : ''}
            GROUP BY e.id, u.name, u.email
            ORDER BY e.created_at DESC
        `, type ? [teamId, cycleId, type] : [teamId, cycleId]);

        // Buscar info do time e ciclo
        const teamResult = await req.db.query('SELECT name FROM teams WHERE id = $1', [teamId]);
        const cycleResult = await req.db.query('SELECT name FROM evaluation_cycles WHERE id = $1', [cycleId]);

        res.json({
            team: teamResult.rows[0],
            cycle: cycleResult.rows[0],
            evaluations: evaluationsResult.rows,
            totalEvaluations: evaluationsResult.rows.length
        });
    } catch (error) {
        console.error('Erro ao buscar participação:', error);
        res.status(500).json({ error: 'Erro ao buscar participação' });
    }
});

// Estatísticas gerais
router.get('/stats', requireAdmin, async (req, res) => {
    try {
        const stats = await req.db.query(`
            SELECT 
                COUNT(DISTINCT e.id) as total_evaluations,
                COUNT(DISTINCT e.team_id) as teams_evaluated,
                COUNT(DISTINCT e.user_id) as unique_evaluators,
                COUNT(DISTINCT e.cycle_id) as cycles_used,
                SUM(CASE WHEN e.evaluation_type = 'kanban' THEN 1 ELSE 0 END) as kanban_count,
                SUM(CASE WHEN e.evaluation_type = 'jornada' THEN 1 ELSE 0 END) as jornada_count
            FROM evaluations e
        `);

        res.json(stats.rows[0]);
    } catch (error) {
        console.error('Erro ao buscar estatísticas:', error);
        res.status(500).json({ error: 'Erro ao buscar estatísticas' });
    }
});

module.exports = router;
