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
 *     summary: Registrar novo usuário
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
 *               - cpf
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
 *               cpf:
 *                 type: string
 *                 example: "12345678901"
 *               telefone:
 *                 type: string
 *                 example: "62999887766"
 *               conheceIFGoiano:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       201:
 *         description: Usuário criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 usuario:
 *                   $ref: '#/components/schemas/Usuario'
 *                 token:
 *                   type: string
 *       400:
 *         description: Dados inválidos
 *       409:
 *         description: Email ou CPF já cadastrado
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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 usuario:
 *                   $ref: '#/components/schemas/Usuario'
 *                 token:
 *                   type: string
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
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Usuario'
 *       401:
 *         description: Não autenticado
 *       404:
 *         description: Usuário não encontrado
 */
router.get('/me', authMiddleware, authController.me);

module.exports = router;