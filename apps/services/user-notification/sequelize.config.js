/* eslint-env node */
module.exports = {
  development: {
    username: process.env.DB_USER_USER_NOTIFICATION ?? 'dev_db',
    password: process.env.DB_PASS_USER_NOTIFICATION ?? 'dev_db',
    database: process.env.DB_NAME_USER_NOTIFICATION ?? 'dev_db',
    host: 'localhost',
    dialect: 'postgres',
    port: process.env.DB_PORT_USER_NOTIFICATION ?? 5432,
    seederStorage: 'sequelize',
  },
  test: {
    username: 'test_db',
    password: 'test_db',
    database: 'test_db',
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres',
  },
  production: {
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    dialect: 'postgres',
  },
}
