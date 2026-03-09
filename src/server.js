require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
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

// ============================================
// [OWASP A05] SEGURANÇA DE CABEÇALHOS — Helmet
// Adiciona: Content-Security-Policy, HSTS, X-Frame-Options,
// X-Content-Type-Options, Referrer-Policy, etc.
// Remove X-Powered-By (não expõe stack tecnológico)
// ============================================
app.use(helmet());

// ============================================
// [OWASP A05] CORS — Origens explícitas
// React Native não envia Origin header em prod,
// mas restrição protege acessos via browser (Swagger, etc.)
// ============================================
const ORIGENS_PERMITIDAS = [
    'http://localhost:4020',            // Swagger local
    'https://plantrexapp-backend.onrender.com', // Produção
];

app.use(cors({
    origin: (origin, callback) => {
        // Permite requisições sem Origin (React Native, curl, Postman)
        if (!origin || ORIGENS_PERMITIDAS.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('CORS: origem não permitida'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
}));

app.use(express.json({ limit: '10kb' })); // [OWASP A04] Limite de payload

// ============================================
// [OWASP A07] RATE LIMITING
// ============================================

// Endpoints de SMS / OTP: máx 10 req / 15 min por IP
const resetLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: 'Muitas tentativas. Tente novamente em 15 minutos.' },
});

// Auth geral: máx 50 req / 15 min por IP
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 50,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: 'Muitas requisições. Tente novamente em 15 minutos.' },
});

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
app.get('/', (_req, res) => {
    res.json({
        message: 'API do PLANTREX no ar!',
        version: '1.0.0',
        status: 'connected to database',
        docs: 'http://localhost:4020/api-docs'
    });
});

// ============================================
// ROTAS DA API
// Limiters específicos devem vir antes do router geral
// ============================================
app.use('/auth/forgot-password', resetLimiter);
app.use('/auth/verify-reset-code', resetLimiter);
app.use('/auth/reset-password', resetLimiter);
app.use('/auth/send-phone-verification', resetLimiter);
app.use('/auth', authLimiter, authRoutes);

app.use('/api/propriedade', propriedadeRoutes);
app.use('/api/cultura', culturaRoutes);
app.use('/api/bioinsumo', bioinsumoRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/praga', pragaRoutes);
app.use('/api/praga-resposta', pragaRespostaRoutes);

// ============================================
// TRATAMENTO DE ERRO 404
// ============================================
app.use((_req, res) => {
    res.status(404).json({ message: 'Rota não encontrada' });
});

// Iniciar servidor
app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
    console.log(`http://localhost:${port}`);
    console.log(`Documentação: http://localhost:${port}/api-docs`);
});
