const Pool = require("pg").Pool;

const pool = new Pool({
    host: "localhost",
    user: "postgres",
    password: "123",
    database: "finance_db"
});

module.exports = pool;