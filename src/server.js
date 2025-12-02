require('dotenv').config();
const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
const authRoutes = require('./routes/authRoutes');
const propriedadeRoutes = require('./routes/propriedadeRoutes');
const culturaRoutes = require('./routes/culturaRoutes');
const bioinsumoRoutes = require('./routes/bioinsumoRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const pragaRespostaRoutes = require('./routes/pragaRespostaRoutes');
const pragaRoutes = require('./routes/pragaRoutes');

const app = express();
const port = process.env.PORT || 4020;

// Middlewares globais
app.use(cors());
app.use(express.json());

// ============================================
// DOCUMENTAÇÃO SWAGGER
// ============================================
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'PLANTREX API Docs',
}));

// ============================================
// ROTA DE TESTE
// ============================================
app.get('/', (req, res) => {
    res.json({
        message: 'API do PLANTREX no ar!',
        version: '1.0.0',
        status: 'connected to database',
        docs: 'http://localhost:4020/api-docs'
    });
});

// ============================================
// ROTAS DA API
// ============================================
app.use('/auth', authRoutes);
app.use('/api/propriedade', propriedadeRoutes);
app.use('/api/cultura', culturaRoutes);
app.use('/api/bioinsumo', bioinsumoRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/praga', pragaRoutes);
app.use('/api/praga-resposta', pragaRespostaRoutes);

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
    console.log(`Servidor rodando na porta ${port}`);
    console.log(`http://localhost:${port}`);
    console.log(`Documentação: http://localhost:${port}/api-docs`);
});