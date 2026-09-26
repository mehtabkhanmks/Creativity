const { Sequelize } = require('sequelize');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const dbPath = process.env.DB_PATH
  ? path.resolve(__dirname, '../../', process.env.DB_PATH)
  : path.resolve(__dirname, '../../database.sqlite');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: dbPath,
  logging: false,
});

module.exports = sequelize;
