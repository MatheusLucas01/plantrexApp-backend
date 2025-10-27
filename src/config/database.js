const { PrismaClient } = require('@prisma/client')

// instância única do Prisma (Singleton)
const prisma = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error'] : ['error'],
});

// Testar conexão
prisma.$connect()
    .then(() => {
        console.log('Conectado ao Postgre!')
    })
    .catch((error) => {
        console.error('Erro ao conectar ao banco:', error)
        process.exit(1)
    });

process.on('beforeExit', async () => {
    await prisma.$disconnect()
});

module.exports = prisma;