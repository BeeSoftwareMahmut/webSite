const express = require('express');
const sql = require('mssql');
const Router = express.Router();

const config = {
  user: 'mahmutari',
  password: 'mahmut1313...',
  server: 'localhost\\SQLEXPRESS',
  database: 'MyData',
  options: {
    encrypt: true,
    trustServerCertificate: true,
  },
};

let pool; // Havuzu başlatmak için kullanılacak değişken

const createPool = async () => {
  try {
    pool = await new sql.ConnectionPool(config).connect();
    console.log('Veritabanı bağlantısı başarıyla kuruldu.');
  } catch (error) {
    console.error('Veritabanına bağlanırken hata:', error);
    throw error;
  }
};

createPool(); // Bağlantı havuzunu oluştur

Router.get('/', async (req, res) => {
  try {
    const query = 'SELECT * FROM LoginData';
    const result = await pool.request().query(query);
    const LoginData = result.recordset;
    res.json({ LoginData });
  } catch (error) {
    console.error('Veri çekme hatası:', error);
    res.status(500).json({ error: 'Veri çekme hatası.' });
  }
});

module.exports = Router;
