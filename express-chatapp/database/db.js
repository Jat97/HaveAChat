const { Pool } = require("pg");

module.exports = new Pool({
  host: "localhost",
  user: process.env.DATABASE_USER,
  database: process.env.DATABASE,
  password: process.env.DATABASE_PASSWORD,
  port: 5432
});