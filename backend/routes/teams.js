const express = require('express');
const router = express.Router();
const db = require('../db');

// Listar todos os times
router.get('/', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM teams ORDER BY name');
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Buscar time por ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await db.query('SELECT * FROM teams WHERE id = $1', [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Time não encontrado' });
        }
        
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Criar novo time
router.post('/', async (req, res) => {
    try {
        const { name, description } = req.body;
        
        const result = await db.query(
            'INSERT INTO teams (name, description) VALUES ($1, $2) RETURNING *',
            [name, description]
        );
        
        res.status(201).json(result.rows[0]);
    } catch (error) {
        if (error.code === '23505') { // Duplicate key
            return res.status(400).json({ error: 'Time já existe' });
        }
        res.status(500).json({ error: error.message });
    }
});

// Atualizar time
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description } = req.body;
        
        const result = await db.query(
            'UPDATE teams SET name = $1, description = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *',
            [name, description, id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Time não encontrado' });
        }
        
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Deletar time
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        const result = await db.query('DELETE FROM teams WHERE id = $1 RETURNING *', [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Time não encontrado' });
        }
        
        res.json({ message: 'Time deletado com sucesso' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
