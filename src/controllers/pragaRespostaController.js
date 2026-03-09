const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Criar ou atualizar resposta de praga
exports.createOrUpdate = async (req, res) => {
    try {
        const usuarioId = req.usuarioId;
        const { pragaIdExterno, commonName, jaViu, conhece, naoConhece, propriedadeId, observacoes } = req.body;

        // Verificar se já existe uma resposta para esta praga
        const respostaExistente = await prisma.pragaResposta.findUnique({
            where: {
                usuarioId_pragaIdExterno: {
                    usuarioId,
                    pragaIdExterno
                }
            }
        });

        let resposta;

        if (respostaExistente) {
            // Atualizar resposta existente
            resposta = await prisma.pragaResposta.update({
                where: { id: respostaExistente.id },
                data: {
                    commonName,
                    jaViu: jaViu || false,
                    conhece: conhece || false,
                    naoConhece: naoConhece || false,
                    propriedadeId,
                    observacoes
                }
            });
        } else {
            // Criar nova resposta
            resposta = await prisma.pragaResposta.create({
                data: {
                    usuarioId,
                    pragaIdExterno,
                    commonName,
                    jaViu: jaViu || false,
                    conhece: conhece || false,
                    naoConhece: naoConhece || false,
                    propriedadeId,
                    observacoes
                }
            });
        }

        res.status(200).json(resposta);
    } catch (error) {
        console.error('Erro ao salvar resposta de praga:', error);
        res.status(500).json({ message: 'Erro ao salvar resposta de praga' });
    }
};

// Listar todas as respostas do usuário
exports.getAll = async (req, res) => {
    try {
        const usuarioId = req.usuarioId;

        const respostas = await prisma.pragaResposta.findMany({
            where: { usuarioId },
            orderBy: { createdAt: 'desc' }
        });

        res.json(respostas);
    } catch (error) {
        console.error('Erro ao buscar respostas:', error);
        res.status(500).json({ message: 'Erro ao buscar respostas de pragas' });
    }
};

// Buscar resposta específica por pragaIdExterno
exports.getByPragaId = async (req, res) => {
    try {
        const usuarioId = req.usuarioId;
        const { pragaIdExterno } = req.params;

        const resposta = await prisma.pragaResposta.findUnique({
            where: {
                usuarioId_pragaIdExterno: {
                    usuarioId,
                    pragaIdExterno
                }
            }
        });

        if (!resposta) {
            return res.status(404).json({ message: 'Resposta não encontrada' });
        }

        res.json(resposta);
    } catch (error) {
        console.error('Erro ao buscar resposta:', error);
        res.status(500).json({ message: 'Erro ao buscar resposta de praga' });
    }
};

// Deletar resposta
exports.delete = async (req, res) => {
    try {
        const usuarioId = req.usuarioId;
        const { id } = req.params;

        // Verificar se a resposta pertence ao usuário
        const resposta = await prisma.pragaResposta.findFirst({
            where: {
                id,
                usuarioId
            }
        });

        if (!resposta) {
            return res.status(404).json({ message: 'Resposta não encontrada' });
        }

        await prisma.pragaResposta.delete({
            where: { id }
        });

        res.json({ message: 'Resposta deletada com sucesso' });
    } catch (error) {
        console.error('Erro ao deletar resposta:', error);
        res.status(500).json({ message: 'Erro ao deletar resposta' });
    }
};

// Obter estatísticas de respostas do usuário
exports.getStats = async (req, res) => {
    try {
        const usuarioId = req.usuarioId;

        const respostas = await prisma.pragaResposta.findMany({
            where: { usuarioId }
        });

        const stats = {
            total: respostas.length,
            jaViu: respostas.filter(r => r.jaViu).length,
            conhece: respostas.filter(r => r.conhece).length,
            naoConhece: respostas.filter(r => r.naoConhece).length
        };

        res.json(stats);
    } catch (error) {
        console.error('Erro ao buscar estatísticas:', error);
        res.status(500).json({ message: 'Erro ao buscar estatísticas' });
    }
};