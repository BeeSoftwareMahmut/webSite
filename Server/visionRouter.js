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

// Veritabanı bağlantısını başlatmak için kullanılan bağlantı havuzu
const pool = new sql.ConnectionPool(config);

pool.connect()
  .then(() => {
    console.log('Veritabanı bağlantısı başarıyla kuruldu.');
  })
  .catch((err) => {
    console.error('Veritabanına bağlanırken hata:', err);
  });

const connectToDatabase = async () => {
  try {
    const pool = await sql.connect(config);
    return pool;
  } catch (error) {
    console.error('Veritabanına bağlanırken hata:', error);
    throw error;
  }
};

Router.get('/get_vision_text', async (req, res) => {
  try {
    const pool = await connectToDatabase();
    const query = 'SELECT * FROM VisionText';
    const result = await pool.request().query(query);
    const visionText = result.recordset;
    res.json({ visionText });
  } catch (error) {
    console.error('Veri çekme hatası:', error);
    res.status(500).json({ error: 'Veri çekme hatası.' });
  }
});

Router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { content } = req.body;
  try {
    const pool = await connectToDatabase();
    const query = `UPDATE VisionText SET content='${content}' where id=${id}`;
    await pool.request().query(query);
    res.json({ message: 'İçerik Başarıyla Güncellendi' });
  } catch (error) {
    console.error('İçerik güncellenemedi:', error);
    res.status(500).json({ error: 'Veri çekme hatası.' });
  }
});

module.exports = Router;
