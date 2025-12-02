const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.create = async (req, res) => {
    try {
        const usuarioId = req.usuarioId;
        const cultura = await prisma.cultura.create({
            data: {
                ...req.body,
                area: parseFloat(req.body.area),
                usuarioId
            }
        });
        res.status(201).json(cultura);
    } catch (error) {
        console.error('Erro ao criar cultura:', error);
        res.status(500).json({ message: 'Erro ao criar cultura' });
    }
};

exports.list = async (req, res) => {
    try {
        const usuarioId = req.usuarioId;
        const culturas = await prisma.cultura.findMany({
            where: { usuarioId }
        });
        res.json(culturas);
    } catch (error) {
        console.error('Erro ao listar culturas:', error);
        res.status(500).json({ message: 'Erro ao listar culturas' });
    }
};

exports.getById = async (req, res) => {
    try {
        const { id } = req.params;
        const cultura = await prisma.cultura.findUnique({
            where: { id }
        });
        if (!cultura) {
            return res.status(404).json({ message: 'Cultura nao encontrada' });
        }
        res.json(cultura);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar cultura' });
    }
};

exports.update = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = { ...req.body };
        if (req.body.area) {
            updateData.area = parseFloat(req.body.area);
        }
        const cultura = await prisma.cultura.update({
            where: { id },
            data: updateData
        });
        res.json(cultura);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao atualizar cultura' });
    }
};

exports.delete = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.cultura.delete({ where: { id } });
        res.json({ message: 'Cultura excluida com sucesso' });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao excluir cultura' });
    }
};