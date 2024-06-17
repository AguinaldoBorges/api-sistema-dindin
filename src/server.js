const express = require('express')
const { route } = require('./routes/routes')
const app = express()
const cors = require('cors');


const port = 4000


app.use(cors());

app.use(express.json());

app.use(route)

app.listen(port, () => console.log(`Servidor rodando na porta ${port}!`))

module.exports = { app }