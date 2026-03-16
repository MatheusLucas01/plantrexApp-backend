const axios = require('axios');

const PRAGAS_API_BASE_URL = process.env.API_IMAGES_PRAGAS_URL;

// Buscar todas as pragas da API externa
exports.getAll = async (req, res) => {
    try {
        const response = await axios.get(PRAGAS_API_BASE_URL);
        // A API externa retorna { data: [...] }, então extraímos o array
        const pragas = response.data.data || response.data;
        res.json(pragas);
    } catch (error) {
        console.error('Erro ao buscar pragas da API externa:', error);
        res.status(500).json({ message: 'Erro ao buscar pragas' });
    }
};

// Buscar praga específica por ID
exports.getById = async (req, res) => {
    try {
        const { id } = req.params;
        const response = await axios.get(`${PRAGAS_API_BASE_URL}/${id}`);
        res.json(response.data);
    } catch (error) {
        console.error('Erro ao buscar praga:', error);
        res.status(500).json({ message: 'Erro ao buscar praga' });
    }
};

// Buscar pragas por cultura
exports.getByCultura = async (req, res) => {
    try {
        const { cultura } = req.params;
        const response = await axios.get(`${PRAGAS_API_BASE_URL}/cultura/${cultura}`);
        res.json(response.data);
    } catch (error) {
        console.error('Erro ao buscar pragas por cultura:', error);
        res.status(500).json({ message: 'Erro ao buscar pragas por cultura' });
    }
};

// Buscar pragas por categoria
exports.getByCategoria = async (req, res) => {
    try {
        const { categoria } = req.params;
        const response = await axios.get(PRAGAS_API_BASE_URL, { params: { category: categoria } });
        const pragas = response.data.data || response.data;
        res.json(pragas);
    } catch (error) {
        console.error('Erro ao buscar pragas por categoria:', error);
        res.status(500).json({ message: 'Erro ao buscar pragas por categoria' });
    }
};