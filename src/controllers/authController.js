const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const prisma = require('../config/database');
const { enviarCodigoEmail } = require('../services/emailService');

/** Gera código numérico de 6 dígitos */
const gerarCodigo = () => String(Math.floor(100000 + Math.random() * 900000));

/** Hash SHA-256 de qualquer string (codes, refresh tokens) */
const hashCodigo = (valor) => crypto.createHash('sha256').update(valor).digest('hex');

/** Gera refresh token criptograficamente seguro (320 bits de entropia) */
const gerarRefreshToken = () => crypto.randomBytes(40).toString('hex');

/** Valida se o telefone tem 10 ou 11 dígitos (DDD + número) */
const telefoneValido = (tel) => /^\d{10,11}$/.test(tel);

const MAX_TENTATIVAS = 5;
const COOLDOWN_MS = 2 * 60 * 1000; // 2 minutos entre reenvios

const gerarAccessToken = (userId) =>
    jwt.sign(
        { id: userId },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

/** Cria e armazena refresh token hashed no banco */
const criarRefreshToken = async (usuarioId) => {
    const rawToken = gerarRefreshToken();
    const expiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRY_MS);

    await prisma.refreshToken.create({
        data: {
            token: hashCodigo(rawToken),
            usuarioId,
            expiresAt,
        }
    });

    return rawToken; // retorna o valor raw para enviar ao cliente
};

// ENVIAR CÓDIGO DE VERIFICAÇÃO DE TELEFONE (pré-cadastro)
exports.sendPhoneVerification = async (req, res) => {
    try {
        const { telefone, email } = req.body;

        if (!telefone || !email) {
            return res.status(400).json({ message: 'Telefone e e-mail são obrigatórios' });
        }

        const apenasDigitos = telefone.replace(/\D/g, '');

        if (!telefoneValido(apenasDigitos)) {
            return res.status(400).json({ message: 'Número de telefone inválido (DDD + número)' });
        }

        // Impede que um telefone já cadastrado inicie novo fluxo
        const telefoneCadastrado = await prisma.usuario.findFirst({
            where: { telefone: apenasDigitos }
        });
        if (telefoneCadastrado) {
            return res.status(409).json({ message: 'Este número já está cadastrado' });
        }

        // Impede que o e-mail já cadastrado inicie novo fluxo
        const emailCadastrado = await prisma.usuario.findUnique({ where: { email } });
        if (emailCadastrado) {
            return res.status(409).json({ message: 'Este e-mail já está cadastrado' });
        }

        // Cooldown de 2 minutos entre reenvios
        const verificacaoExistente = await prisma.verificacaoTelefone.findUnique({
            where: { telefone: apenasDigitos }
        });
        if (verificacaoExistente) {
            const elapsed = Date.now() - new Date(verificacaoExistente.sentAt).getTime();
            if (elapsed < COOLDOWN_MS) {
                const restante = Math.ceil((COOLDOWN_MS - elapsed) / 1000);
                return res.status(429).json({
                    message: `Aguarde ${restante} segundos antes de solicitar um novo código.`
                });
            }
        }

        const codigo = gerarCodigo();

        // Upsert — cria ou substitui o registro temporário
        await prisma.verificacaoTelefone.upsert({
            where: { telefone: apenasDigitos },
            update: {
                codigo: hashCodigo(codigo),
                expiry: new Date(Date.now() + 10 * 60 * 1000),
                attempts: 0,
                sentAt: new Date(),
            },
            create: {
                telefone: apenasDigitos,
                codigo: hashCodigo(codigo),
                expiry: new Date(Date.now() + 10 * 60 * 1000),
            }
        });

        // Envia código por e-mail (gratuito, sem dependência de provedor SMS)
        await enviarCodigoEmail(email, codigo, 'cadastro');

        return res.json({ message: 'Código enviado por SMS' });

    } catch (error) {
        console.error('Erro ao enviar verificação:', error);
        return res.status(500).json({ message: 'Erro ao enviar código de verificação' });
    }
};

// REGISTRO
exports.register = async (req, res) => {
    try {
        const { nome, email, senha } = req.body;

        if (!nome || !email || !senha) {
            return res.status(400).json({ message: 'Nome, email e senha são obrigatórios' });
        }

        if (senha.length < 6) {
            return res.status(400).json({ message: 'Senha deve ter no mínimo 6 caracteres' });
        }

        const emailExiste = await prisma.usuario.findUnique({ where: { email } });
        if (emailExiste) {
            return res.status(409).json({ message: 'Email já cadastrado' });
        }

        const senhaHash = await bcrypt.hash(senha, 10);

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

        const accessToken = gerarAccessToken(novoUsuario.id);

        return res.status(201).json({
            message: 'Usuário cadastrado com sucesso',
            usuario: novoUsuario,
            accessToken,
        });

    } catch (error) {
        console.error('Erro ao registrar:', error);
        return res.status(500).json({ message: 'Erro ao cadastrar usuário' });
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

        const accessToken = gerarAccessToken(usuario.id);

        const { senha, ...usuarioSemSenha } = usuario;

        return res.json({
            message: 'Login realizado com sucesso',
            usuario: usuarioSemSenha,
            accessToken,
        });

    } catch (error) {
        console.error('Erro no login:', error);
        return res.status(500).json({
            message: 'Erro ao fazer login'
        });
    }
};

// REFRESH TOKEN — troca refresh por novo par de tokens (rotação)
exports.refresh = async (req, res) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(400).json({ message: 'Refresh token é obrigatório' });
        }

        const hashedToken = hashCodigo(refreshToken);

        const registro = await prisma.refreshToken.findUnique({
            where: { token: hashedToken },
            include: { usuario: { select: { id: true, formularioCompleto: true } } }
        });

        if (!registro) {
            return res.status(401).json({ message: 'Refresh token inválido' });
        }

        if (new Date() > registro.expiresAt) {
            await prisma.refreshToken.delete({ where: { id: registro.id } });
            return res.status(401).json({ message: 'Refresh token expirado. Faça login novamente.' });
        }

        // [Rotação] Invalida o token antigo e emite um novo par
        await prisma.refreshToken.delete({ where: { id: registro.id } });

        const newAccessToken = gerarAccessToken(registro.usuarioId);
        const newRefreshToken = await criarRefreshToken(registro.usuarioId);

        return res.json({ accessToken: newAccessToken, refreshToken: newRefreshToken });

    } catch (error) {
        console.error('Erro ao renovar token:', error);
        return res.status(500).json({ message: 'Erro ao renovar sessão' });
    }
};

// LOGOUT — invalida o refresh token do dispositivo
exports.logout = async (req, res) => {
    try {
        const { refreshToken } = req.body;

        if (refreshToken) {
            const hashedToken = hashCodigo(refreshToken);
            await prisma.refreshToken.deleteMany({ where: { token: hashedToken } });
        }

        return res.json({ message: 'Logout realizado com sucesso' });

    } catch (error) {
        console.error('Erro ao fazer logout:', error);
        return res.status(500).json({ message: 'Erro ao fazer logout' });
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

// SOLICITAR CÓDIGO DE REDEFINIÇÃO VIA SMS
exports.forgotPassword = async (req, res) => {
    // Resposta genérica usada em todos os caminhos (evita user enumeration)
    const respostaGenerica = { message: 'Se o número estiver cadastrado, você receberá um e-mail em breve.' };

    try {
        const { telefone } = req.body;

        if (!telefone) {
            return res.status(400).json({ message: 'Número de telefone é obrigatório' });
        }

        const apenasDigitos = telefone.replace(/\D/g, '');

        // [OWASP A04] Validação de formato antes de tocar no banco
        if (!telefoneValido(apenasDigitos)) {
            return res.status(400).json({ message: 'Número de telefone inválido' });
        }

        const usuario = await prisma.usuario.findFirst({
            where: { telefone: apenasDigitos }
        });

        // [OWASP A04 - Timing] Introduz delay fixo para equalizar o tempo de resposta
        // independente de o usuário existir ou não, prevenindo enumeração por tempo.
        await new Promise((r) => setTimeout(r, 300));

        if (!usuario) {
            return res.json(respostaGenerica);
        }

        // [OWASP A04 - SMS Bombing] Cooldown de 2 minutos entre reenvios
        if (usuario.resetCodeSentAt) {
            const elapsed = Date.now() - new Date(usuario.resetCodeSentAt).getTime();
            if (elapsed < COOLDOWN_MS) {
                const restante = Math.ceil((COOLDOWN_MS - elapsed) / 1000);
                return res.status(429).json({
                    message: `Aguarde ${restante} segundos antes de solicitar um novo código.`
                });
            }
        }

        const codigo = gerarCodigo();

        // [OWASP A02] Armazena apenas o hash SHA-256 — nunca o código em texto plano
        await prisma.usuario.update({
            where: { id: usuario.id },
            data: {
                resetCode: hashCodigo(codigo),
                resetCodeExpiry: new Date(Date.now() + 10 * 60 * 1000), // 10 min
                resetAttempts: 0,
                resetCodeSentAt: new Date(),
            }
        });

        // Envia para o e-mail cadastrado do usuário
        await enviarCodigoEmail(usuario.email, codigo, 'redefinicao');

        return res.json(respostaGenerica);

    } catch (error) {
        console.error('Erro ao solicitar redefinição:', error);
        return res.status(500).json({ message: 'Erro ao processar solicitação' });
    }
};

// VERIFICAR CÓDIGO SMS
exports.verifyResetCode = async (req, res) => {
    try {
        const { telefone, codigo } = req.body;

        if (!telefone || !codigo) {
            return res.status(400).json({ message: 'Telefone e código são obrigatórios' });
        }

        const apenasDigitos = telefone.replace(/\D/g, '');

        // [OWASP A04] Valida formato do código (exatamente 6 dígitos)
        if (!/^\d{6}$/.test(codigo)) {
            return res.status(400).json({ message: 'Código deve ter exatamente 6 dígitos' });
        }

        if (!telefoneValido(apenasDigitos)) {
            return res.status(400).json({ message: 'Número de telefone inválido' });
        }

        const usuario = await prisma.usuario.findFirst({
            where: { telefone: apenasDigitos }
        });

        if (!usuario || !usuario.resetCode || !usuario.resetCodeExpiry) {
            return res.status(400).json({ message: 'Código inválido ou expirado' });
        }

        // [OWASP A07 - Brute Force] Bloqueia após MAX_TENTATIVAS erradas
        if (usuario.resetAttempts >= MAX_TENTATIVAS) {
            await prisma.usuario.update({
                where: { id: usuario.id },
                data: { resetCode: null, resetCodeExpiry: null, resetAttempts: 0, resetCodeSentAt: null }
            });
            return res.status(429).json({
                message: 'Muitas tentativas incorretas. Solicite um novo código.'
            });
        }

        if (new Date() > usuario.resetCodeExpiry) {
            return res.status(400).json({ message: 'Código expirado. Solicite um novo.' });
        }

        // [OWASP A02] Compara o hash, não o código em texto plano
        if (usuario.resetCode !== hashCodigo(codigo)) {
            await prisma.usuario.update({
                where: { id: usuario.id },
                data: { resetAttempts: { increment: 1 } }
            });
            const restantes = MAX_TENTATIVAS - (usuario.resetAttempts + 1);
            return res.status(400).json({
                message: `Código incorreto. ${restantes > 0 ? `${restantes} tentativa(s) restante(s).` : 'Solicite um novo código.'}`
            });
        }

        return res.json({ message: 'Código verificado com sucesso' });

    } catch (error) {
        console.error('Erro ao verificar código:', error);
        return res.status(500).json({ message: 'Erro ao verificar código' });
    }
};

// REDEFINIR SENHA
exports.resetPassword = async (req, res) => {
    try {
        const { telefone, codigo, novaSenha } = req.body;

        if (!telefone || !codigo || !novaSenha) {
            return res.status(400).json({ message: 'Telefone, código e nova senha são obrigatórios' });
        }

        if (novaSenha.length < 6) {
            return res.status(400).json({ message: 'A senha deve ter no mínimo 6 caracteres' });
        }

        // [OWASP A04] Valida formatos antes de qualquer operação no banco
        if (!/^\d{6}$/.test(codigo)) {
            return res.status(400).json({ message: 'Código deve ter exatamente 6 dígitos' });
        }

        const apenasDigitos = telefone.replace(/\D/g, '');

        if (!telefoneValido(apenasDigitos)) {
            return res.status(400).json({ message: 'Número de telefone inválido' });
        }

        const usuario = await prisma.usuario.findFirst({
            where: { telefone: apenasDigitos }
        });

        if (!usuario || !usuario.resetCode || !usuario.resetCodeExpiry) {
            return res.status(400).json({ message: 'Solicitação inválida. Reinicie o processo.' });
        }

        // [OWASP A07] Bloqueia após MAX_TENTATIVAS
        if (usuario.resetAttempts >= MAX_TENTATIVAS) {
            await prisma.usuario.update({
                where: { id: usuario.id },
                data: { resetCode: null, resetCodeExpiry: null, resetAttempts: 0, resetCodeSentAt: null }
            });
            return res.status(429).json({
                message: 'Muitas tentativas incorretas. Solicite um novo código.'
            });
        }

        if (new Date() > usuario.resetCodeExpiry) {
            return res.status(400).json({ message: 'Código expirado. Solicite um novo.' });
        }

        // [OWASP A02] Compara hash
        if (usuario.resetCode !== hashCodigo(codigo)) {
            await prisma.usuario.update({
                where: { id: usuario.id },
                data: { resetAttempts: { increment: 1 } }
            });
            return res.status(400).json({ message: 'Código incorreto' });
        }

        const senhaHash = await bcrypt.hash(novaSenha, 10);

        // Atualiza senha, limpa campos de reset e invalida todas as sessões ativas
        await prisma.$transaction([
            prisma.usuario.update({
                where: { id: usuario.id },
                data: {
                    senha: senhaHash,
                    resetCode: null,
                    resetCodeExpiry: null,
                    resetAttempts: 0,
                    resetCodeSentAt: null,
                }
            }),
            // [OWASP] Invalida todos os refresh tokens — força novo login em todos dispositivos
            prisma.refreshToken.deleteMany({ where: { usuarioId: usuario.id } }),
        ]);

        return res.json({ message: 'Senha redefinida com sucesso' });

    } catch (error) {
        console.error('Erro ao redefinir senha:', error);
        return res.status(500).json({ message: 'Erro ao redefinir senha' });
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