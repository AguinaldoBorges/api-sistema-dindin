const { pool } = require('../conexao');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const senhaJwt = require('../senhaJWT');

const olaMundo = (req, res) => {
    res.send('Olá Mundo!');

}

const criarUsuario = async (req, res) => {
    const { nome, email, senha } = req.body;

    try {
        // Consulta se o email já está cadastrado
        const consultaEmails = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);

        const usuario = consultaEmails.rows

        // Criptografar senha
        const senhaCriptografada = await bcrypt.hash(senha, 10)

        if (usuario.length > 0) {
            // Se o usuário já existe, retorne um erro
            return res.status(400).json({ mensagem: "Email já cadastrado" });
        }

        // Se o usuário não existe, faça o cadastro
        const resultCadastro = await pool.query(
            'INSERT INTO usuarios (nome, email, senha) VALUES ($1, $2, $3) RETURNING *',
            [nome, email, senhaCriptografada]
        );

        return res.status(201).json({ mensagem: 'Usuário cadastrado com sucesso!', Usuario: resultCadastro.rows[0] });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Algo deu errado no servidor.' });
    }
};

const detalharUsuario = async (req, res) => {
    const usuarioId = req.params.id; // Supondo que você passará o ID na URL

    try {
        const result = await pool.query('SELECT * FROM usuarios WHERE id = $1', [usuarioId]);

        if (result.rowCount === 0) {
            res.status(404).json({ message: 'Usuário não encontrado' });
        } else {
            res.status(200).json({
                id: result.rows[0].id,
                nome: result.rows[0].nome,
                email: result.rows[0].email
            });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ mensagem: "Para acessar este recurso um token de autenticação válido deve ser enviado." });
    }
}

const atualizarUsuario = async (req, res) => {
    const usuarioId = req.params.id; // Supondo que você passará o ID na URL
    const usuario = await pool.query('SELECT * FROM usuarios WHERE id = $1', [usuarioId]);
    const { nome, email, senha } = req.body;

    try {
        if (!nome || !email || !senha) {
            return res.status(401).json({ mensagem: 'Nome, email ou senha faltando. Campos obrigatórios!' })
        }

        /* Validar email */
        const emailValidado = !(await pool.query('SELECT * FROM usuarios WHERE id <> $1 AND email = $2 ', [usuario.rows[0].id, email])).rowCount;

        if (!emailValidado) {
            return res.status(401).json({ mensagem: 'O email informado já está cadastrado em outra conta.' })
        }

        // Criptografar senha
        const senhaCriptografada = await bcrypt.hash(senha, 10)

        const result = await pool.query(
            'UPDATE usuarios SET nome = $1, email = $2, senha = $3 WHERE id = $4 RETURNING *',
            [nome, email, senhaCriptografada, usuarioId]
        );

        if (result.rowCount === 0) {
            res.status(404).json({ message: 'Usuário não encontrado' });
        } else {
            res.status(200).json({ usuario: result.rows[0] });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro ao alterar o usuário' });
    }
}

const logarUsuario = async (req, res) => {
    const { email, senha } = req.body;
    // Verifica o email e carrega o usuário
    try {
        const usuario = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);
        if (usuario.rows.length === 0) {
            return res.status(401).json({ message: 'Email ou senha incorreta' });
        }

        const senhaValida = await bcrypt.compare(senha, usuario.rows[0].senha)

        /* Verifica a senha */
        if (!senhaValida) {
            return res.status(401).json({ message: 'Email ou senha incorreta' });
        }

        const id = usuario.rows[0].id;

        // Gere um token JWT
        const token = jwt.sign({ id }, senhaJwt, { expiresIn: '8h' });
        return res.json({
            usuario: {
                id: usuario.rows[0].id,
                nome: usuario.rows[0].nome,
                email: usuario.rows[0].email
            },
            token: token
        });


    } catch (err) {
        console.error(err);
        res.status(500).json({ err: 'Erro ao logar o usuário' });
    }
}


module.exports = { olaMundo, criarUsuario, logarUsuario, detalharUsuario, atualizarUsuario }