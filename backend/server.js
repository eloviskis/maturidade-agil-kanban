const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

// Importar rotas
const teamsRoutes = require('./routes/teams');
const evaluationsRoutes = require('./routes/evaluations');
const cyclesRoutes = require('./routes/cycles');
const authRoutes = require('./routes/auth');
const reportsRoutes = require('./routes/reports');
const adminRoutes = require('./routes/admin');

// Usar rotas
app.use('/api/teams', teamsRoutes);
app.use('/api/evaluations', evaluationsRoutes);
app.use('/api/cycles', cyclesRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/admin', adminRoutes);

// Rota raiz - servir frontend
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Rota de saúde
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Servidor funcionando!' });
});

// Tratamento de erros
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Algo deu errado!', message: err.message });
});

// Iniciar servidor apenas se não estiver no Vercel
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
        console.log(`📊 API disponível em http://localhost:${PORT}/api`);
    });
}

module.exports = app;
