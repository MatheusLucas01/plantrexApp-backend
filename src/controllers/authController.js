const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/database');

// REGISTRO
exports.register = async (req, res) => {
    try {
        const { nome, email, senha } = req.body;

        // Validação básica
        if (!nome || !email || !senha) {
            return res.status(400).json({
                message: 'Nome, email e senha obrigatórios'
            });
        }

        if (senha.length < 6) {
            return res.status(400).json({
                message: 'Senha deve ter no mínimo 6 caracteres'
            });
        }

        // Verificar se email já existe
        const emailExiste = await prisma.usuario.findUnique({
            where: { email }
        });

        if (emailExiste) {
            return res.status(409).json({
                message: 'Email já cadastrado'
            });
        }


        // Criptografar senha
        const senhaHash = await bcrypt.hash(senha, 10);

        // Criar usuário
        const novoUsuario = await prisma.usuario.create({
            data: {
                nome,
                email,
                senha: senhaHash,
                formularioCompleto: false,
            },
            select: {
                id: true,
                nome: true,
                email: true,
                formularioCompleto: true,
                createdAt: true
            }
        });

        // Gerar token JWT
        const token = jwt.sign(
            { id: novoUsuario.id, email: novoUsuario.email },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
        );

        return res.status(201).json({
            message: 'Usuário cadastrado com sucesso',
            usuario: novoUsuario,
            token
        });

    } catch (error) {
        console.error('Erro ao registrar:', error);
        return res.status(500).json({
            message: 'Erro ao cadastrar usuário'
        });
    }
};

// LOGIN
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validação básica
        if (!email || !password) {
            return res.status(400).json({
                message: 'Email e senha são obrigatórios'
            });
        }

        // Buscar usuário
        const usuario = await prisma.usuario.findUnique({
            where: { email }
        });

        if (!usuario) {
            return res.status(401).json({
                message: 'Email ou senha inválidos'
            });
        }

        // Verificar senha
        const senhaValida = await bcrypt.compare(password, usuario.senha);

        if (!senhaValida) {
            return res.status(401).json({
                message: 'Email ou senha inválidos'
            });
        }

        // Gerar token
        const token = jwt.sign(
            { id: usuario.id, email: usuario.email },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
        );

        // Remover senha da resposta
        const { senha, ...usuarioSemSenha } = usuario;

        return res.json({
            message: 'Login realizado com sucesso',
            usuario: usuarioSemSenha,
            token
        });

    } catch (error) {
        console.error('Erro no login:', error);
        return res.status(500).json({
            message: 'Erro ao fazer login'
        });
    }
};

// BUSCAR USUÁRIO AUTENTICADO
exports.me = async (req, res) => {
    try {
        const usuario = await prisma.usuario.findUnique({
            where: { id: req.usuarioId },
            select: {
                id: true,
                nome: true,
                email: true,
                cpf: true,
                telefone: true,
                dataNascimento: true,
                estadoCivil: true,
                conheceIFGoiano: true,
                conheceCursosTecnicos: true,
                formularioCompleto: true,
                createdAt: true
            }
        });

        if (!usuario) {
            return res.status(404).json({
                message: 'Usuário não encontrado'
            });
        }

        return res.json(usuario);

    } catch (error) {
        console.error('Erro ao buscar usuário:', error);
        return res.status(500).json({
            message: 'Erro ao buscar dados do usuário'
        });
    }
};

// ATUALIZAR PERFIL (Dados completos do formulário)
exports.updateProfile = async (req, res) => {
    try {
        const {
            cpf,
            telefone,
            dataNascimento,
            estadoCivil,
            conheceIFGoiano,
            conheceCursosTecnicos
        } = req.body;

        // Se CPF foi informado, verificar se já existe
        if (cpf) {
            const cpfExiste = await prisma.usuario.findFirst({
                where: {
                    cpf,
                    NOT: {
                        id: req.usuarioId  // Ignora o próprio usuário
                    }
                }
            });

            if (cpfExiste) {
                return res.status(409).json({
                    message: 'CPF já cadastrado por outro usuário'
                });
            }
        }

        // Atualizar perfil
        const usuarioAtualizado = await prisma.usuario.update({
            where: { id: req.usuarioId },
            data: {
                cpf,
                telefone,
                dataNascimento: dataNascimento ? new Date(dataNascimento) : undefined,
                estadoCivil,
                conheceIFGoiano,
                conheceCursosTecnicos,
                formularioCompleto: true,
            },
            select: {
                id: true,
                nome: true,
                email: true,
                cpf: true,
                telefone: true,
                dataNascimento: true,
                estadoCivil: true,
                conheceIFGoiano: true,
                conheceCursosTecnicos: true,
                formularioCompleto: true,
                updatedAt: true
            }
        });

        return res.json({
            message: 'Perfil atualizado com sucesso',
            usuario: usuarioAtualizado
        });

    } catch (error) {
        console.error('Erro ao atualizar perfil:', error);
        return res.status(500).json({
            message: 'Erro ao atualizar perfil'
        });
    }
};

// PÁGINA HOME (Rota protegida)
exports.home = async (req, res) => {
    try {
        // Buscar dados do usuário autenticado
        const usuario = await prisma.usuario.findUnique({
            where: { id: req.usuarioId },
            select: {
                id: true,
                nome: true,
                email: true,
                cpf: true,
                telefone: true,
                dataNascimento: true,
                estadoCivil: true,
                conheceIFGoiano: true,
                conheceCursosTecnicos: true,
                createdAt: true
            }
        });

        if (!usuario) {
            return res.status(404).json({
                message: 'Usuário não encontrado'
            });
        }

        return res.json({
            message: `Bem-vindo à página home, ${usuario.nome}!`,
            user: usuario
        });

    } catch (error) {
        console.error('Erro ao acessar home:', error);
        return res.status(500).json({
            message: 'Erro ao acessar página home'
        });
    }
};