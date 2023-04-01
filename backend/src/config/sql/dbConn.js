const { Pool } = require('pg');
const dotenv = require('dotenv').config();

// Create a new PostgreSQL pool instance
const dbConnectionString = 'postgres://faslu007:b9fLVgA2ZHsI@ep-gentle-shape-640636.us-east-2.aws.neon.tech/CDMS';

// Create a new PostgreSQL pool instance
const pool = new Pool({
  connectionString: dbConnectionString,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
  ssl: { sslmode: 'require' },
});



// Export the pool
module.exports = {
  pool,
};