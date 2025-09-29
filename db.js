const sql = require("mssql");
require("dotenv").config();

const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_DATABASE,
  options: {
    trustServerCertificate: true,
  },
};

async function getPool() {
  if (!global.pool) {
    global.pool = await sql.connect(config);
    console.log("✅ Connected to MSSQL");
  }
  return global.pool;
}

module.exports = { sql, getPool };
