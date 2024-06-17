const express = require('express')
const route = express.Router(); // Usar express.Router() em vez de express()
const { criarUsuario, logarUsuario, detalharUsuario, atualizarUsuario } = require('../controlers/usuarios')
const { listaTransacoes, detalhaTransacao, cadastraTransacao, atualizaTransacao, deletaTransacao, extrato } = require('../controlers/transacoes')
const verificarUsuarioLogado = require('../intermediarios/autenticacao');
const { listarCategorias } = require('../controlers/categorias');

/* Rotas livres */
route.post('/login', logarUsuario);
route.post('/usuario', criarUsuario);

/* Midware */
route.use(verificarUsuarioLogado)

/* Rotas seguras */
route.get('/usuario/:id', detalharUsuario);
route.put('/usuario/:id', atualizarUsuario);
route.get('/categoria', listarCategorias);;
route.get('/transacao', listaTransacoes);
route.get('/transacao/:id', detalhaTransacao);
route.post('/transacao', cadastraTransacao);
route.put('/transacao/:id', atualizaTransacao);
route.delete('/transacao/:id', deletaTransacao);
route.get('/transacao/extrato', extrato);

module.exports = { route };