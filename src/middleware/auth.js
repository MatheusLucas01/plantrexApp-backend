const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    try {
        // Buscar token do header Authorization
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({
                message: 'Token não fornecido'
            });
        }

        // Formato esperado: "Bearer TOKEN"
        const parts = authHeader.split(' ');

        if (parts.length !== 2) {
            return res.status(401).json({
                message: 'Token mal formatado'
            });
        }

        const [scheme, token] = parts;

        if (!/^Bearer$/i.test(scheme)) {
            return res.status(401).json({
                message: 'Token mal formatado'
            });
        }

        // Verificar token
        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) {
                return res.status(401).json({
                    message: 'Token inválido ou expirado'
                });
            }

            // Adicionar ID do usuário à requisição
            req.usuarioId = decoded.id;
            req.usuarioEmail = decoded.email;

            return next();
        });

    } catch (error) {
        return res.status(500).json({
            message: 'Erro ao processar autenticação'
        });
    }
};

module.exports = authMiddleware;