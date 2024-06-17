const { Pool } = require('pg')


const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'dindin',
    password: '10203040',
    port: 5432,
})


module.exports = { pool };