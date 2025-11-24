const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.create = async (req, res) => {
    try {
        const usuarioId = req.usuarioId;
        const bioinsumo = await prisma.bioinsumo.create({
            data: {
                ...req.body,
                usuarioId
            }
        });
        res.status(201).json(bioinsumo);
    } catch (error) {
        console.error('Erro ao criar bioinsumo:', error);
        res.status(500).json({ message: 'Erro ao criar registro de bioinsumo' });
    }
};

exports.list = async (req, res) => {
    try {
        const usuarioId = req.usuarioId;
        const bioinsumos = await prisma.bioinsumo.findMany({
            where: { usuarioId }
        });
        res.json(bioinsumos);
    } catch (error) {
        console.error('Erro ao listar bioinsumos:', error);
        res.status(500).json({ message: 'Erro ao listar bioinsumos' });
    }
};

exports.getById = async (req, res) => {
    try {
        const { id } = req.params;
        const bioinsumo = await prisma.bioinsumo.findUnique({
            where: { id }
        });
        if (!bioinsumo) {
            return res.status(404).json({ message: 'Bioinsumo nao encontrado' });
        }
        res.json(bioinsumo);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar bioinsumo' });
    }
};

exports.update = async (req, res) => {
    try {
        const { id } = req.params;
        const bioinsumo = await prisma.bioinsumo.update({
            where: { id },
            data: req.body
        });
        res.json(bioinsumo);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao atualizar bioinsumo' });
    }
};

exports.delete = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.bioinsumo.delete({ where: { id } });
        res.json({ message: 'Bioinsumo excluido com sucesso' });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao excluir bioinsumo' });
    }
};