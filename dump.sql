-- Criação do banco de dados
CREATE DATABASE dindin;

-- Tabela 'usuarios'
CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100),
    email VARCHAR(100) UNIQUE,
    senha VARCHAR(100)
);

-- Tabela 'categorias'
CREATE TABLE categorias (
    id SERIAL PRIMARY KEY,
    descricao VARCHAR(100)
);

-- Tabela 'transacoes'
CREATE TABLE transacoes (
    id SERIAL PRIMARY KEY,
    descricao VARCHAR(100),
    valor DECIMAL(10, 2),
    data DATE,
    categoria_id INT REFERENCES categorias(id),
    usuario_id INT REFERENCES usuarios(id),
    tipo VARCHAR(10)
);

-- Inserir as catogorias na tabela 'categorias'

INSERT INTO categorias (descricao)
VALUES 
  ('Alimentação'),
  ('Assinaturas e Serviços'),
  ('Casa'),
  ('Mercado'),
  ('Cuidados Pessoais'),
  ('Educação'),
  ('Família'),
  ('Lazer'),
  ('Pets'),
  ('Presentes'),
  ('Roupas'),
  ('Saúde'),
  ('Transporte'),
  ('Salário'),
  ('Vendas'),
  ('Outras receitas'),
  ('Outras despesas');