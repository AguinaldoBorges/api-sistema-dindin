const { pool } = require('../conexao');
const jwt = require('jsonwebtoken');
const senhaJwt = require('../senhaJWT');
const { checaCategoria, cadastrarTransacao } = require('./funcoes')

async function listaTransacoes(req, res) {
    const idUsuario = req.usuario.id;
    try {
        const client = await pool.connect();

        const query = `
            SELECT 
                transacoes.id, 
                transacoes.tipo, 
                transacoes.descricao, 
                transacoes.valor::numeric, 
                transacoes.data, 
                transacoes.usuario_id, 
                transacoes.categoria_id, 
                categorias.descricao as categoria_nome
            FROM 
                transacoes
            LEFT JOIN 
                categorias ON transacoes.categoria_id = categorias.id
            WHERE 
                transacoes.usuario_id = $1
        `;

        const result = await client.query(query, [idUsuario]);

        client.release();

        const formattedResult = result.rows.map(row => ({
            id: row.id,
            tipo: row.tipo,
            descricao: row.descricao,
            valor: parseFloat(row.valor),
            data: row.data,
            usuario_id: row.usuario_id,
            categoria_id: row.categoria_id,
            categoria_nome: row.categoria_nome
        }));

        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify(formattedResult, null, 2)); // Formata o JSON

    } catch (error) {
        console.error('Erro ao executar consulta:', error);
        res.status(500).send('Erro ao buscar transações');
    }
}


async function detalhaTransacao(req, res, next) {
    const idUsuario = req.usuario.id;
    const transacaoId = req.params.id;

    if (!/^\d+$/.test(transacaoId)) {
        // Passe para a próxima rota usando o 'next()'
        return next();
    }

    try {
        const client = await pool.connect();

        const query = `
            SELECT 
                transacoes.id, 
                transacoes.tipo, 
                transacoes.descricao, 
                transacoes.valor::numeric, 
                transacoes.data, 
                transacoes.usuario_id, 
                transacoes.categoria_id, 
                categorias.descricao as categoria_nome
            FROM 
                transacoes
            LEFT JOIN 
                categorias ON transacoes.categoria_id = categorias.id
            WHERE 
                transacoes.id = $1 AND transacoes.usuario_id = $2
        `;

        const result = await client.query(query, [transacaoId, idUsuario]);

        client.release();


        if (result.rows.length === 0) {
            return res.status(404).send('Transação não encontrada');
        } else {

            const formattedResult = {
                id: result.rows[0].id,
                tipo: result.rows[0].tipo,
                descricao: result.rows[0].descricao,
                valor: parseFloat(result.rows[0].valor),
                data: result.rows[0].data,
                usuario_id: result.rows[0].usuario_id,
                categoria_id: result.rows[0].categoria_id,
                categoria_nome: result.rows[0].categoria_nome
            };

            res.setHeader('Content-Type', 'application/json');
            res.send(JSON.stringify(formattedResult, null, 2));
        }

    } catch (error) {
        console.error('Erro ao buscar transação:', error);
        res.status(500).send('Erro ao buscar transação');
    }
}

async function cadastraTransacao(req, res) {
    const { descricao, valor, data, categoria_id, tipo } = req.body;
    const idUsuario = req.usuario.id;

    if (!descricao || !valor || !data || !categoria_id || !tipo) {
        return res.status(400).json({ mensagem: 'Todos os campos obrigatórios devem ser informados.' });
    }

    if (tipo !== 'entrada' && tipo !== 'saida') {
        return res.status(400).json({ mensagem: 'O tipo deve ser "entrada" ou "saida".' });
    }

    try {

        const categoriaExiste = await checaCategoria(categoria_id);

        if (!categoriaExiste) {
            return res.status(404).json({ mensagem: 'Categoria não encontrada.' });
        }

        const transacao = await cadastrarTransacao(idUsuario, descricao, valor, data, categoria_id, tipo);

        return res.status(201).json({
            id: transacao.id,
            tipo: transacao.tipo,
            descricao: transacao.descricao,
            valor: transacao.valor,
            data: transacao.data,
            usuario_id: transacao.usuario_id,
            categoria_id: transacao.categoria_id,
            categoria_nome: transacao.categoria_nome,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ mensagem: 'Erro ao cadastrar a transação.' });
    }
}

async function atualizaTransacao(req, res) {
    const { descricao, valor, data, categoria_id, tipo } = req.body;
    const idUsuario = req.usuario.id;
    const transacaoId = req.params.id;

    if (!descricao || !valor || !data || !categoria_id || !tipo) {
        return res.status(400).json({ mensagem: 'Todos os campos obrigatórios devem ser informados.' });
    }

    if (tipo !== 'entrada' && tipo !== 'saida') {
        return res.status(400).json({ mensagem: 'O tipo deve ser "entrada" ou "saida".' });
    }

    try {
        const query = 'SELECT * FROM transacoes WHERE id = $1 AND usuario_id = $2';
        const result = await pool.query(query, [transacaoId, idUsuario]);

        if (result.rows.length === 0) {
            return res.status(404).json({ mensagem: 'Transação não encontrada para este usuário.' });
        }


        const categoriaExiste = await checaCategoria(categoria_id);

        if (!categoriaExiste) {
            return res.status(404).json({ mensagem: 'Categoria não encontrada.' });
        }

        const updateQuery =
            'UPDATE transacoes SET descricao = $1, valor = $2, data = $3, categoria_id = $4, tipo = $5 WHERE id = $6';
        await pool.query(updateQuery, [descricao, valor, data, categoria_id, tipo, transacaoId]);
        return res.status(204).end();
    } catch (error) {
        console.error(error);
        return res.status(500).json({ mensagem: 'Erro ao atualizar a transação.' });
    }
}

async function deletaTransacao(req, res) {
    const idUsuario = req.usuario.id;
    const transacaoId = req.params.id;

    try {

        const query = 'SELECT * FROM transacoes WHERE id = $1 AND usuario_id = $2';
        const result = await pool.query(query, [transacaoId, idUsuario]);

        if (result.rows.length === 0) {
            return res.status(404).json({ mensagem: 'Transação não encontrada para este usuário.' });
        }


        const deleteQuery = 'DELETE FROM transacoes WHERE id = $1';
        await pool.query(deleteQuery, [transacaoId]);

        return res.status(204).end();
    } catch (error) {
        console.error(error);
        return res.status(500).json({ mensagem: 'Erro ao excluir a transação.' });
    }
}

async function extrato(req, res) {
    const idUsuario = req.usuario.id;

    try {

        const queryEntrada = 'SELECT COALESCE(SUM(valor), 0) as total_entrada FROM transacoes WHERE usuario_id = $1 AND tipo = $2';
        const resultEntrada = await pool.query(queryEntrada, [idUsuario, 'entrada']);
        const totalEntrada = parseFloat(resultEntrada.rows[0].total_entrada || 0);


        const querySaida = 'SELECT COALESCE(SUM(valor), 0) as total_saida FROM transacoes WHERE usuario_id = $1 AND tipo = $2';
        const resultSaida = await pool.query(querySaida, [idUsuario, 'saida']);
        const totalSaida = parseFloat(resultSaida.rows[0].total_saida || 0);


        return res.status(200).json({ entrada: totalEntrada, saida: totalSaida });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ mensagem: 'Erro ao obter o extrato de transações.' });
    }
}


module.exports = { listaTransacoes, detalhaTransacao, cadastraTransacao, atualizaTransacao, deletaTransacao, extrato };
