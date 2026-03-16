const prisma = require('../config/database');

// CRIAR PROPRIEDADE
exports.create = async (req, res) => {
    try {
        const {
            nome,
            localizacao,
            coordenadas,
            tamanho,
            unidadeMedida,
            // Textura do solo
            texturaArenosa,
            texturaArenosaPerc,
            texturaMedia,
            texturaMediaPerc,
            texturaArgilosa,
            texturaArgilosaPerc,
            // Declividade
            soloPlano,
            soloPlanoPerc,
            soloDeclivModerada,
            soloDeclivModeradaPerc,
            soloDeclivAcentuada,
            soloDeclivAcentuadaPerc,
            // Solo (legado)
            soloArenoso,
            soloArgiloso,
            soloComCascalhos,
            soloComPedras,
            soloDeVarzea,
            soloRaso,
            soloProfundo,
            // Bioinsumos
            conheceBioinsumos,
            utilizaBioinsumos,
            tiposBioinsumos,
            resultadosBioinsumos,
            expectativasBioinsumos,
            // Limitacoes
            limitacaoAgua,
            limitacaoSolo,
            limitacaoRecursosFinanceiros,
            limitacaoAcessoInsumos,
            limitacaoEstrada,
            limitacaoTransporte,
            limitacaoMaoDeObra,
            limitacaoImpostos,
            limitacaoPragas,
            limitacaoDoencas,
            limitacaoMaquinario,
        } = req.body;

        if (!nome || !localizacao || !tamanho) {
            return res.status(400).json({
                message: 'Nome, localização e tamanho são obrigatórios'
            });
        }

        const propriedade = await prisma.propriedade.create({
            data: {
                nome,
                localizacao,
                coordenadas,
                tamanho: parseFloat(tamanho),
                unidadeMedida: unidadeMedida || 'HECTARE',
                texturaArenosa,
                texturaArenosaPerc: texturaArenosaPerc ? parseFloat(texturaArenosaPerc) : null,
                texturaMedia,
                texturaMediaPerc: texturaMediaPerc ? parseFloat(texturaMediaPerc) : null,
                texturaArgilosa,
                texturaArgilosaPerc: texturaArgilosaPerc ? parseFloat(texturaArgilosaPerc) : null,
                soloPlano,
                soloPlanoPerc: soloPlanoPerc ? parseFloat(soloPlanoPerc) : null,
                soloDeclivModerada,
                soloDeclivModeradaPerc: soloDeclivModeradaPerc ? parseFloat(soloDeclivModeradaPerc) : null,
                soloDeclivAcentuada,
                soloDeclivAcentuadaPerc: soloDeclivAcentuadaPerc ? parseFloat(soloDeclivAcentuadaPerc) : null,
                soloArenoso,
                soloArgiloso,
                soloComCascalhos,
                soloComPedras,
                soloDeVarzea,
                soloRaso,
                soloProfundo,
                conheceBioinsumos,
                utilizaBioinsumos,
                tiposBioinsumos: tiposBioinsumos || [],
                resultadosBioinsumos,
                expectativasBioinsumos,
                limitacaoAgua,
                limitacaoSolo,
                limitacaoRecursosFinanceiros,
                limitacaoAcessoInsumos,
                limitacaoEstrada,
                limitacaoTransporte,
                limitacaoMaoDeObra,
                limitacaoImpostos,
                limitacaoPragas,
                limitacaoDoencas,
                limitacaoMaquinario,
                usuarioId: req.usuarioId,
            }
        });

        return res.status(201).json({
            message: 'Propriedade criada com sucesso',
            propriedade
        });

    } catch (error) {
        console.error('Erro ao criar propriedade:', error);
        return res.status(500).json({
            message: 'Erro ao criar propriedade'
        });
    }
};

// LISTAR PROPRIEDADES DO USUÁRIO
exports.list = async (req, res) => {
    try {
        const propriedades = await prisma.propriedade.findMany({
            where: { usuarioId: req.usuarioId },
            include: { culturas: true }
        });

        return res.json(propriedades);

    } catch (error) {
        console.error('Erro ao listar propriedades:', error);
        return res.status(500).json({
            message: 'Erro ao listar propriedades'
        });
    }
};

// BUSCAR PROPRIEDADE POR ID
exports.getById = async (req, res) => {
    try {
        const { id } = req.params;

        const propriedade = await prisma.propriedade.findFirst({
            where: {
                id,
                usuarioId: req.usuarioId
            },
            include: { culturas: true }
        });

        if (!propriedade) {
            return res.status(404).json({
                message: 'Propriedade não encontrada'
            });
        }

        return res.json(propriedade);

    } catch (error) {
        console.error('Erro ao buscar propriedade:', error);
        return res.status(500).json({
            message: 'Erro ao buscar propriedade'
        });
    }
};

// ATUALIZAR PROPRIEDADE
exports.update = async (req, res) => {
    try {
        const { id } = req.params;

        // Verifica se pertence ao usuário
        const existe = await prisma.propriedade.findFirst({
            where: { id, usuarioId: req.usuarioId }
        });

        if (!existe) {
            return res.status(404).json({
                message: 'Propriedade não encontrada'
            });
        }

        const parsePerc = (val) => (val !== undefined && val !== '' && val !== null) ? parseFloat(val) : null;

        const propriedade = await prisma.propriedade.update({
            where: { id },
            data: {
                ...req.body,
                tamanho: req.body.tamanho ? parseFloat(req.body.tamanho) : undefined,
                texturaArenosaPerc: parsePerc(req.body.texturaArenosaPerc),
                texturaMediaPerc: parsePerc(req.body.texturaMediaPerc),
                texturaArgilosaPerc: parsePerc(req.body.texturaArgilosaPerc),
                soloPlanoPerc: parsePerc(req.body.soloPlanoPerc),
                soloDeclivModeradaPerc: parsePerc(req.body.soloDeclivModeradaPerc),
                soloDeclivAcentuadaPerc: parsePerc(req.body.soloDeclivAcentuadaPerc),
            }
        });

        return res.json({
            message: 'Propriedade atualizada com sucesso',
            propriedade
        });

    } catch (error) {
        console.error('Erro ao atualizar propriedade:', error);
        return res.status(500).json({
            message: 'Erro ao atualizar propriedade'
        });
    }
};

// DELETAR PROPRIEDADE
exports.delete = async (req, res) => {
    try {
        const { id } = req.params;

        const existe = await prisma.propriedade.findFirst({
            where: { id, usuarioId: req.usuarioId }
        });

        if (!existe) {
            return res.status(404).json({
                message: 'Propriedade não encontrada'
            });
        }

        await prisma.propriedade.delete({
            where: { id }
        });

        return res.json({
            message: 'Propriedade deletada com sucesso'
        });

    } catch (error) {
        console.error('Erro ao deletar propriedade:', error);
        return res.status(500).json({
            message: 'Erro ao deletar propriedade'
        });
    }
};