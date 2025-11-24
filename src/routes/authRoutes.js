const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');

/**
 * @swagger
 * components:
 *   schemas:
 *     Usuario:
 *       type: object
 *       required:
 *         - nome
 *         - email
 *         - senha
 *         - cpf
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: ID único do usuário
 *         nome:
 *           type: string
 *           description: Nome completo do produtor rural
 *         email:
 *           type: string
 *           format: email
 *           description: Email único do usuário
 *         cpf:
 *           type: string
 *           description: CPF (11 dígitos)
 *         telefone:
 *           type: string
 *           description: Telefone de contato
 *         conheceIFGoiano:
 *           type: boolean
 *           description: Conhece o IFGoiano Campos Belos
 *         conheceCursosTecnicos:
 *           type: boolean
 *           description: Sabe sobre os cursos técnicos
 *       example:
 *         id: 123e4567-e89b-12d3-a456-426614174000
 *         nome: João da Silva
 *         email: joao@exemplo.com
 *         cpf: "12345678901"
 *         telefone: "62999887766"
 *         conheceIFGoiano: true
 *         conheceCursosTecnicos: false
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Registrar novo usuário (dados básicos)
 *     tags: [Autenticação]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nome
 *               - email
 *               - senha
 *             properties:
 *               nome:
 *                 type: string
 *                 example: João da Silva
 *               email:
 *                 type: string
 *                 format: email
 *                 example: joao@exemplo.com
 *               senha:
 *                 type: string
 *                 format: password
 *                 minLength: 6
 *                 example: "123456"
 *     responses:
 *       201:
 *         description: Usuário criado com sucesso
 *       409:
 *         description: Email já cadastrado
 */
router.post('/register', authController.register);


/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Fazer login
 *     tags: [Autenticação]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: joao@exemplo.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: Login realizado com sucesso
 *       401:
 *         description: Credenciais inválidas
 */
router.post('/login', authController.login);

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Buscar dados do usuário autenticado
 *     tags: [Autenticação]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dados do usuário
 *       401:
 *         description: Não autenticado
 */
router.get('/me', authMiddleware, authController.me);

/**
 * @swagger
 * /auth/profile:
 *   put:
 *     summary: Completar/atualizar perfil do usuário (formulário completo)
 *     tags: [Autenticação]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               cpf:
 *                 type: string
 *                 example: "12345678901"
 *               telefone:
 *                 type: string
 *                 example: "62999887766"
 *               dataNascimento:
 *                 type: string
 *                 format: date
 *                 example: "1990-05-15"
 *               estadoCivil:
 *                 type: string
 *                 example: "CASADO"
 *               conheceIFGoiano:
 *                 type: boolean
 *                 example: true
 *               conheceCursosTecnicos:
 *                 type: boolean
 *                 example: false
 *     responses:
 *       200:
 *         description: Perfil atualizado com sucesso
 *       409:
 *         description: CPF já cadastrado
 */
router.put('/profile', authMiddleware, authController.updateProfile);

/**
 * @swagger
 * /auth/home:
 *   get:
 *     summary: Acessar página home (rota protegida)
 *     tags: [Autenticação]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dados da página home
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Bem-vindo à página home!"
 *                 user:
 *                   $ref: '#/components/schemas/Usuario'
 *       401:
 *         description: Não autenticado
 */
router.get('/home', authMiddleware, authController.home);

module.exports = router;