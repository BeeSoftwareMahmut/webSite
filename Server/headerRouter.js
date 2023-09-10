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

Router.get('/getdata', async (req, res) => {
  try {
    const query = 'SELECT * FROM HeaderData';
    const result = await pool.request().query(query);
    const HeaderData = result.recordset;
    res.json({ HeaderData });
  } catch (error) {
    console.error('Veri çekme hatası:', error);
    res.status(500).json({ error: 'Veri çekme hatası.' });
  }
});

Router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { title } = req.body;

  try {
    const query = `UPDATE HeaderData SET title='${title}' where id=${id}`;
    await pool.request().query(query);
    res.json({ message: "Başlık Başarılı bir şekilde güncellendi" });
  } catch (error) {
    console.error('Veri güncelleme hatası:', error);
    res.status(500).json({ error: 'Veri güncelleme hatası.' });
  }
});

module.exports = Router;
