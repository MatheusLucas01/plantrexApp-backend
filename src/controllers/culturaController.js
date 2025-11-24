const prisma = require('../config/database');

// CRIAR CULTURA
exports.create = async (req, res) => {
    try {
        const {
            propriedadeId,
            tipoCultura,
            area,
            unidadeMedida,
            tipoManejo,
            conhecimento,
            pragasIds,
            pragasNomes,
        } = req.body;

        if (!propriedadeId || !tipoCultura || !area) {
            return res.status(400).json({
                message: 'Propriedade, tipo de cultura e área são obrigatórios'
            });
        }

        // Verifica se a propriedade pertence ao usuário
        const propriedade = await prisma.propriedade.findFirst({
            where: {
                id: propriedadeId,
                usuarioId: req.usuarioId
            }
        });

        if (!propriedade) {
            return res.status(404).json({
                message: 'Propriedade não encontrada'
            });
        }

        const cultura = await prisma.cultura.create({
            data: {
                tipoCultura,
                area: parseFloat(area),
                unidadeMedida: unidadeMedida || 'HECTARE',
                tipoManejo,
                conhecimento,
                pragasIds: pragasIds || [],
                pragasNomes: pragasNomes || [],
                propriedadeId,
            }
        });

        return res.status(201).json({
            message: 'Cultura criada com sucesso',
            cultura
        });

    } catch (error) {
        console.error('Erro ao criar cultura:', error);
        return res.status(500).json({
            message: 'Erro ao criar cultura'
        });
    }
};

// LISTAR CULTURAS DE UMA PROPRIEDADE
exports.listByPropriedade = async (req, res) => {
    try {
        const { propriedadeId } = req.params;

        // Verifica se a propriedade pertence ao usuário
        const propriedade = await prisma.propriedade.findFirst({
            where: {
                id: propriedadeId,
                usuarioId: req.usuarioId
            }
        });

        if (!propriedade) {
            return res.status(404).json({
                message: 'Propriedade não encontrada'
            });
        }

        const culturas = await prisma.cultura.findMany({
            where: { propriedadeId }
        });

        return res.json(culturas);

    } catch (error) {
        console.error('Erro ao listar culturas:', error);
        return res.status(500).json({
            message: 'Erro ao listar culturas'
        });
    }
};

// ATUALIZAR CULTURA
exports.update = async (req, res) => {
    try {
        const { id } = req.params;

        // Busca a cultura e verifica se pertence ao usuário
        const cultura = await prisma.cultura.findFirst({
            where: { id },
            include: { propriedade: true }
        });

        if (!cultura || cultura.propriedade.usuarioId !== req.usuarioId) {
            return res.status(404).json({
                message: 'Cultura não encontrada'
            });
        }

        const culturaAtualizada = await prisma.cultura.update({
            where: { id },
            data: {
                ...req.body,
                area: req.body.area ? parseFloat(req.body.area) : undefined,
            }
        });

        return res.json({
            message: 'Cultura atualizada com sucesso',
            cultura: culturaAtualizada
        });

    } catch (error) {
        console.error('Erro ao atualizar cultura:', error);
        return res.status(500).json({
            message: 'Erro ao atualizar cultura'
        });
    }
};

// DELETAR CULTURA
exports.delete = async (req, res) => {
    try {
        const { id } = req.params;

        const cultura = await prisma.cultura.findFirst({
            where: { id },
            include: { propriedade: true }
        });

        if (!cultura || cultura.propriedade.usuarioId !== req.usuarioId) {
            return res.status(404).json({
                message: 'Cultura não encontrada'
            });
        }

        await prisma.cultura.delete({
            where: { id }
        });

        return res.json({
            message: 'Cultura deletada com sucesso'
        });

    } catch (error) {
        console.error('Erro ao deletar cultura:', error);
        return res.status(500).json({
            message: 'Erro ao deletar cultura'
        });
    }
};