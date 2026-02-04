const express = require('express');
const router = express.Router();
const db = require('../db');

// Listar ciclos
router.get('/', async (req, res) => {
    try {
        const result = await db.query(
            'SELECT * FROM evaluation_cycles ORDER BY start_date DESC'
        );
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Buscar ciclo ativo
router.get('/active', async (req, res) => {
    try {
        const result = await db.query(
            'SELECT * FROM evaluation_cycles WHERE is_active = true ORDER BY start_date DESC LIMIT 1'
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Nenhum ciclo ativo encontrado' });
        }
        
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Criar novo ciclo
router.post('/', async (req, res) => {
    try {
        const { name, start_date, end_date, description } = req.body;
        
        const result = await db.query(
            'INSERT INTO evaluation_cycles (name, start_date, end_date, description) VALUES ($1, $2, $3, $4) RETURNING *',
            [name, start_date, end_date, description]
        );
        
        res.status(201).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Ativar/desativar ciclo
router.patch('/:id/toggle', async (req, res) => {
    try {
        const { id } = req.params;
        
        const result = await db.query(
            'UPDATE evaluation_cycles SET is_active = NOT is_active WHERE id = $1 RETURNING *',
            [id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Ciclo não encontrado' });
        }
        
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
