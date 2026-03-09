const jwt = require('jsonwebtoken');

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

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const userId = decoded.sub || decoded.id;
        if (!userId) {
            return res.status(401).json({ message: 'Token inválido' });
        }

        req.usuarioId = userId;
        return next();

    } catch (error) {
        return res.status(401).json({ message: 'Token inválido' });
    }
};

module.exports = authMiddleware;
