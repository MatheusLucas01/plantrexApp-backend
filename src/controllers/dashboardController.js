const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getDashboard = async (req, res) => {
    try {
        const usuarioId = req.usuarioId;

        // Buscar todas as informações do usuário
        const [propriedades, culturas, bioinsumos, usuario, pragasRespostas] = await Promise.all([
            prisma.propriedade.findMany({ where: { usuarioId } }),
            prisma.cultura.findMany({ where: { usuarioId } }),
            prisma.bioinsumo.findMany({ where: { usuarioId } }),
            prisma.usuario.findUnique({
                where: { id: usuarioId },
                select: { nome: true, email: true }
            }),
            prisma.pragaResposta.findMany({ where: { usuarioId } })
        ]);

        // Calcular totais
        const totalPropriedades = propriedades.length;
        const totalAreaPropriedades = propriedades.reduce((sum, p) => sum + p.tamanho, 0);

        const totalCulturas = culturas.length;
        const totalAreaCulturas = culturas.reduce((sum, c) => sum + c.area, 0);

        const utilizaBioinsumos = bioinsumos.some(b => b.utilizaBioinsumos);
        const conheceBioinsumos = bioinsumos.some(b => b.conheceBioinsumos);

        // Culturas mais plantadas
        const culturasAgrupadas = culturas.reduce((acc, c) => {
            acc[c.tipoCultura] = (acc[c.tipoCultura] || 0) + 1;
            return acc;
        }, {});

        const culturasTop = Object.entries(culturasAgrupadas)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([cultura]) => cultura);

        // Pragas
        const pragasNaPropriedade = pragasRespostas
            .filter(r => r.jaViu)
            .map(r => ({ id: r.pragaIdExterno, nome: r.commonName || 'Praga desconhecida' }));

        res.json({
            usuario: {
                nome: usuario?.nome,
                email: usuario?.email
            },
            propriedades: {
                total: totalPropriedades,
                areaTotal: Math.round(totalAreaPropriedades * 10) / 10,
                lista: propriedades.map(p => ({
                    id: p.id,
                    nome: p.nome,
                    tamanho: p.tamanho,
                    localizacao: p.localizacao
                }))
            },
            culturas: {
                total: totalCulturas,
                areaTotal: Math.round(totalAreaCulturas * 10) / 10,
                top3: culturasTop,
                lista: culturas.map(c => ({
                    id: c.id,
                    tipo: c.tipoCultura,
                    area: c.area
                }))
            },
            bioinsumos: {
                utiliza: utilizaBioinsumos,
                conhece: conheceBioinsumos
            },
            pragas: {
                total: pragasRespostas.length,
                jaViu: pragasRespostas.filter(r => r.jaViu).length,
                conhece: pragasRespostas.filter(r => r.conhece).length,
                naoConhece: pragasRespostas.filter(r => r.naoConhece).length,
                naPropriedade: pragasNaPropriedade
            }
        });

    } catch (error) {
        console.error('Erro ao buscar dashboard:', error);
        res.status(500).json({ message: 'Erro ao carregar dashboard' });
    }
};
