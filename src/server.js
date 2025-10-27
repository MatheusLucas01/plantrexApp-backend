require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');

const app = express();
const port = process.env.PORT || 4020;

// Middlewares globais
app.use(cors());
app.use(express.json());

// ============================================
// ROTA DE TESTE
// ============================================
app.get('/', (req, res) => {
    res.json({
        message: 'API do PLANTREX no ar!',
        version: '1.0.0',
        status: 'connected to database'
    });
});

// ============================================
// ROTAS DA API
// ============================================
app.use('/auth', authRoutes);

// ============================================
// TRATAMENTO DE ERRO 404
// ============================================
app.use((req, res) => {
    res.status(404).json({
        message: 'Rota não encontrada'
    });
});

// Iniciar servidor
app.listen(port, () => {
    console.log(`✅ Servidor rodando na porta ${port}`);
    console.log(`📍 http://localhost:${port}`);
});