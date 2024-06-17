const { pool } = require('../conexao');

const listarCategorias = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM categorias');
        res.status(200).send(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro ao buscar usuarios' });
    }
}

module.exports = { listarCategorias }