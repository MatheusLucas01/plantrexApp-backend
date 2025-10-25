require('dotenv').config()

const express = require('express')
const cors = require('cors')

const app = express()
const port = process.env.PORT || 4020;

// Middlewares globais
app.use(cors());
app.use(express.json())

app.get('/', (req, res) => {
    res.json({
        message: 'API do Plantrex no ar!',
        version: '1.0.0'
    })
});


app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`)
})