const { pool } = require('../conexao');
async function checaCategoria(categoria_id) {
    try {
        const result = await pool.query('SELECT * FROM categorias WHERE id = $1', [categoria_id]);

        if (result.rows.length > 0) {
            return true;
        } else {
            return false;
        }
    } catch (error) {
        console.error('Erro ao verificar a existência da categoria:', error);
        throw error;
    }
}

async function cadastrarTransacao(usuarioId, descricao, valor, data, categoria_id, tipo) {
    try {
        const result = await pool.query(
            'INSERT INTO transacoes (usuario_id, descricao, valor, data, categoria_id, tipo) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [usuarioId, descricao, valor, data, categoria_id, tipo]
        );
        return result.rows[0];
    } catch (error) {
        console.error('Erro ao cadastrar a transação:', error);
        throw error;
    }
}


module.exports = { checaCategoria, cadastrarTransacao }