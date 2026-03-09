const jwt = require('jsonwebtoken');

const JWT_ISSUER = 'plantrex';
const JWT_AUDIENCE = 'plantrex-mobile';

const authMiddleware = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({ message: 'Token não fornecido' });
        }

        const parts = authHeader.split(' ');

        if (parts.length !== 2 || !/^Bearer$/i.test(parts[0])) {
            return res.status(401).json({ message: 'Token mal formatado' });
        }

        const token = parts[1];

        // [OWASP API2 / JWT BP] Valida assinatura + iss + aud + exp em uma única chamada
        jwt.verify(
            token,
            process.env.JWT_SECRET,
            { issuer: JWT_ISSUER, audience: JWT_AUDIENCE },
            (err, decoded) => {
                if (err) {
                    // Diferencia token expirado de token inválido para UX melhor
                    if (err.name === 'TokenExpiredError') {
                        return res.status(401).json({ message: 'Token expirado', code: 'TOKEN_EXPIRED' });
                    }
                    return res.status(401).json({ message: 'Token inválido' });
                }

                // [JWT BP] Usa sub como identificador — nenhum PII no token
                if (!decoded.sub) {
                    return res.status(401).json({ message: 'Token inválido' });
                }

                req.usuarioId = decoded.sub;
                return next();
            }
        );

    } catch (error) {
        return res.status(500).json({ message: 'Erro ao processar autenticação' });
    }
};

module.exports = authMiddleware;
