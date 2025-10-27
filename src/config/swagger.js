const swaggerJsdoc = require('swagger-jsdoc');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'API PLANTREX - Cadastro de Produtores Rurais',
            version: '1.0.0',
            description: 'API para cadastro e gestão de informações de produtores rurais, propriedades e culturas agrícolas',
            contact: {
                name: 'PLANTREX',
                email: 'contato@plantrex.com',
            },
        },
        servers: [
            {
                url: 'http://localhost:4020',
                description: 'Servidor de Desenvolvimento',
            },
            {
                url: 'https://api.plantrex.com',
                description: 'Servidor de Produção',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
        },
        security: [
            {
                bearerAuth: [],
            },
        ],
    },
    apis: ['./src/routes/*.js'], // Caminho para os arquivos de rotas
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;