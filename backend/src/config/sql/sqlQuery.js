const { pool } = require('./dbConn');

async function query(text, params) {
  const start = Date.now();
  const client = await pool.connect();
  try {
    const result = await client.query(text, params);
    const duration = Date.now() - start;
    return result.rows;
  } catch (error) {
    throw error;
} finally {
    client.release();
  }
}

module.exports = {
  query,
};