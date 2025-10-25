const express = require('express')
const app = express()
const port = 4020


app.get('/', (req, res) => {
    res.send('Api do Plantrex no ar!')
});


app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`)
})