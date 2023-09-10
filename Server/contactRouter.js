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

// Bağlantı havuzu oluşturma işlemi
const pool = new sql.ConnectionPool(config);

pool.connect()
  .then(() => {
    console.log('Veritabanı bağlantısı başarıyla kuruldu.');
  })
  .catch((err) => {
    console.error('Veritabanına bağlanırken hata:', err);
  });

Router.get('/get_contact_data', async (req, res) => {
  try {
    const query = 'SELECT * FROM ContactData';
    const result = await pool.request().query(query);
    const contactData = result.recordset;
    res.json({ contactData });
  } catch (error) {
    console.error('Veri çekme hatası:', error);
    res.status(500).json({ error: 'Veri çekme hatası.' });
  }
});

Router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { phone, email, adres } = req.body;

  try {
    const query = `UPDATE ContactData SET phone='${phone}', email='${email}', adres='${adres}' where id=${id}`;
    await pool.request().query(query);
    res.json({ message: "İletişim Bilgileri Başarılı bir şekilde Güncellendi" });
  } catch (error) {
    console.error('İletişim bilgileri güncelleme hatası:', error);
    res.status(500).json({ error: 'İletişim bilgileri güncelleme hatası.' });
  }
});

module.exports = Router;
