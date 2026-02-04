const express = require('express');
const router = express.Router();
const db = require('../db');

// Relatório consolidado de um time em um ciclo
router.get('/team/:teamId/cycle/:cycleId', async (req, res) => {
    try {
        const { teamId, cycleId } = req.params;
        const evaluationType = req.query.type || 'kanban';
        
        // Buscar avaliações do time no ciclo com tipo específico
        const evaluations = await db.query(`
            SELECT e.id, u.name as evaluator_name
            FROM evaluations e
            JOIN users u ON e.user_id = u.id
            WHERE e.team_id = $1 AND e.cycle_id = $2 AND e.evaluation_type = $3
        `, [teamId, cycleId, evaluationType]);
        
        if (evaluations.rows.length === 0) {
            return res.status(404).json({ error: 'Nenhuma avaliação encontrada' });
        }
        
        // Calcular média das respostas
        const avgQuery = `
            SELECT 
                ea.question_number,
                AVG(ea.answer_value) as avg_answer
            FROM evaluation_answers ea
            JOIN evaluations e ON ea.evaluation_id = e.id
            WHERE e.team_id = $1 AND e.cycle_id = $2 AND e.evaluation_type = $3
            GROUP BY ea.question_number
            ORDER BY ea.question_number
        `;
        
        const avgResult = await db.query(avgQuery, [teamId, cycleId, evaluationType]);
        
        // Organizar respostas médias
        const avgAnswers = {};
        avgResult.rows.forEach(row => {
            avgAnswers[`q${row.question_number}`] = parseFloat(row.avg_answer).toFixed(2);
        });
        
        // Definir categorias baseadas no tipo de avaliação
        let categories, maxScore;
        
        if (evaluationType === 'kanban') {
            categories = {
                'Práticas Kanban': [1, 2, 3, 4],
                'Gestão de Fluxo': [5, 6, 7, 8],
                'Métricas e Melhoria': [9, 10, 11, 12],
                'Colaboração': [13, 14, 15, 16],
                'Qualidade': [17, 18, 19, 20],
                'Adaptação': [21, 22, 23, 24]
            };
            maxScore = 120;
        } else {
            categories = {
                'Dinâmica da Equipe': [1, 2, 3, 4, 5, 6],
                'Ambiente da Equipe': [7, 8, 9, 10, 11],
                'Organização e Cultura': [12, 13],
                'Mecânica dos Processos': [14, 15, 16, 17, 18, 19],
                'Produto': [20, 21, 22, 23, 24],
                'Qualidade dos Itens': [25, 26, 27, 28, 29, 30],
                'Fluxo e Engenharia': [31, 32, 33, 34, 35, 36, 37, 38, 39, 40]
            };
            maxScore = 200;
        }
        
        const categoryScores = {};
        let totalScore = 0;
        
        Object.keys(categories).forEach(category => {
            let categoryTotal = 0;
            categories[category].forEach(q => {
                const value = parseFloat(avgAnswers[`q${q}`]) || 0;
                categoryTotal += value;
                totalScore += value;
            });
            
            categoryScores[category] = {
                score: categoryTotal.toFixed(2),
                percentage: ((categoryTotal / (categories[category].length * 5)) * 100).toFixed(1)
            };
        });
        
        const overallPercentage = ((totalScore / maxScore) * 100).toFixed(1);
        
        // Determinar nível de maturidade
        let maturityLevel, maturityDescription;
        if (overallPercentage >= 90) {
            maturityLevel = "Otimizado";
            maturityDescription = "Time de alta maturidade com práticas excelentes e melhoria contínua estabelecida.";
        } else if (overallPercentage >= 75) {
            maturityLevel = "Avançado";
            maturityDescription = "Time maduro com boas práticas consolidadas e foco em otimização.";
        } else if (overallPercentage >= 60) {
            maturityLevel = "Intermediário";
            maturityDescription = "Time em desenvolvimento com práticas estabelecidas, mas com oportunidades de melhoria.";
        } else if (overallPercentage >= 40) {
            maturityLevel = "Iniciante";
            maturityDescription = "Time começando a implementar práticas ágeis, necessita de apoio e desenvolvimento.";
        } else {
            maturityLevel = "Ad-hoc";
            maturityDescription = "Time no início da jornada ágil, requer treinamento e mentoria intensiva.";
        }
        
        res.json({
            teamId,
            cycleId,
            evaluationType,
            evaluationCount: evaluations.rows.length,
            evaluators: evaluations.rows.map(e => e.evaluator_name),
            avgAnswers,
            categoryScores,
            totalScore: totalScore.toFixed(2),
            maxScore,
            overallPercentage,
            maturityLevel,
            maturityDescription
        });
        
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Comparativo histórico de um time (evolução ao longo dos ciclos)
router.get('/team/:teamId/history', async (req, res) => {
    try {
        const { teamId } = req.params;
        
        // Buscar todos os ciclos com avaliações para este time
        const cyclesQuery = `
            SELECT DISTINCT
                ec.id,
                ec.name,
                ec.start_date,
                ec.end_date,
                COUNT(e.id) as evaluation_count
            FROM evaluation_cycles ec
            JOIN evaluations e ON ec.id = e.cycle_id
            WHERE e.team_id = $1
            GROUP BY ec.id, ec.name, ec.start_date, ec.end_date
            ORDER BY ec.start_date ASC
        `;
        
        const cyclesResult = await db.query(cyclesQuery, [teamId]);
        
        if (cyclesResult.rows.length === 0) {
            return res.status(404).json({ error: 'Nenhum histórico encontrado' });
        }
        
        const history = [];
        
        // Para cada ciclo, calcular métricas
        for (const cycle of cyclesResult.rows) {
            const avgQuery = `
                SELECT 
                    ea.question_number,
                    AVG(ea.answer_value) as avg_answer
                FROM evaluation_answers ea
                JOIN evaluations e ON ea.evaluation_id = e.id
                WHERE e.team_id = $1 AND e.cycle_id = $2
                GROUP BY ea.question_number
                ORDER BY ea.question_number
            `;
            
            const avgResult = await db.query(avgQuery, [teamId, cycle.id]);
            
            let totalScore = 0;
            avgResult.rows.forEach(row => {
                totalScore += parseFloat(row.avg_answer);
            });
            
            const overallPercentage = ((totalScore / 120) * 100).toFixed(1);
            
            // Calcular por categoria
            const categories = {
                'Práticas Kanban': [1, 2, 3, 4],
                'Gestão de Fluxo': [5, 6, 7, 8],
                'Métricas e Melhoria': [9, 10, 11, 12],
                'Colaboração': [13, 14, 15, 16],
                'Qualidade': [17, 18, 19, 20],
                'Adaptação': [21, 22, 23, 24]
            };
            
            const categoryScores = {};
            
            Object.keys(categories).forEach(category => {
                let categoryTotal = 0;
                categories[category].forEach(q => {
                    const answer = avgResult.rows.find(r => r.question_number === q);
                    categoryTotal += answer ? parseFloat(answer.avg_answer) : 0;
                });
                
                categoryScores[category] = ((categoryTotal / (categories[category].length * 5)) * 100).toFixed(1);
            });
            
            history.push({
                cycleId: cycle.id,
                cycleName: cycle.name,
                startDate: cycle.start_date,
                endDate: cycle.end_date,
                evaluationCount: cycle.evaluation_count,
                totalScore: totalScore.toFixed(2),
                overallPercentage,
                categoryScores
            });
        }
        
        res.json({
            teamId,
            history
        });
        
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Comparar dois ciclos específicos
router.get('/compare/:teamId/:cycle1Id/:cycle2Id', async (req, res) => {
    try {
        const { teamId, cycle1Id, cycle2Id } = req.params;
        
        // Função auxiliar para buscar dados de um ciclo
        const getCycleData = async (cycleId) => {
            const avgQuery = `
                SELECT 
                    ea.question_number,
                    AVG(ea.answer_value) as avg_answer
                FROM evaluation_answers ea
                JOIN evaluations e ON ea.evaluation_id = e.id
                WHERE e.team_id = $1 AND e.cycle_id = $2
                GROUP BY ea.question_number
                ORDER BY ea.question_number
            `;
            
            const result = await db.query(avgQuery, [teamId, cycleId]);
            
            let totalScore = 0;
            const answers = {};
            
            result.rows.forEach(row => {
                const value = parseFloat(row.avg_answer);
                answers[`q${row.question_number}`] = value;
                totalScore += value;
            });
            
            return {
                totalScore: totalScore.toFixed(2),
                overallPercentage: ((totalScore / 120) * 100).toFixed(1),
                answers
            };
        };
        
        const [cycle1Data, cycle2Data] = await Promise.all([
            getCycleData(cycle1Id),
            getCycleData(cycle2Id)
        ]);
        
        // Calcular diferenças
        const diff = {
            totalScore: (cycle2Data.totalScore - cycle1Data.totalScore).toFixed(2),
            overallPercentage: (cycle2Data.overallPercentage - cycle1Data.overallPercentage).toFixed(1),
            questionDiffs: {}
        };
        
        for (let i = 1; i <= 24; i++) {
            const q = `q${i}`;
            const val1 = cycle1Data.answers[q] || 0;
            const val2 = cycle2Data.answers[q] || 0;
            diff.questionDiffs[q] = (val2 - val1).toFixed(2);
        }
        
        res.json({
            teamId,
            cycle1: { id: cycle1Id, ...cycle1Data },
            cycle2: { id: cycle2Id, ...cycle2Data },
            difference: diff
        });
        
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Dashboard geral - resumo de todos os times no ciclo atual
router.get('/dashboard/current', async (req, res) => {
    try {
        // Buscar ciclo ativo
        const cycleResult = await db.query(
            'SELECT id, name FROM evaluation_cycles WHERE is_active = true ORDER BY start_date DESC LIMIT 1'
        );
        
        if (cycleResult.rows.length === 0) {
            return res.status(404).json({ error: 'Nenhum ciclo ativo' });
        }
        
        const cycleId = cycleResult.rows[0].id;
        
        // Buscar resumo de cada time
        const teamsQuery = `
            SELECT 
                t.id,
                t.name,
                COUNT(DISTINCT e.id) as evaluation_count,
                AVG(ea.answer_value) * 24 / 5 as avg_percentage
            FROM teams t
            LEFT JOIN evaluations e ON t.id = e.team_id AND e.cycle_id = $1
            LEFT JOIN evaluation_answers ea ON e.id = ea.evaluation_id
            GROUP BY t.id, t.name
            ORDER BY t.name
        `;
        
        const teamsResult = await db.query(teamsQuery, [cycleId]);
        
        res.json({
            cycleId,
            cycleName: cycleResult.rows[0].name,
            teams: teamsResult.rows.map(team => ({
                id: team.id,
                name: team.name,
                evaluationCount: parseInt(team.evaluation_count),
                avgPercentage: team.avg_percentage ? parseFloat(team.avg_percentage).toFixed(1) : '0.0'
            }))
        });
        
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
