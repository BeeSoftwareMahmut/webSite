const express = require('express');
const sql = require('mssql');
const multer = require('multer');
const fs = require('fs');
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

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, '../public/images/');
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const fileName = `${timestamp}-${file.originalname}`;
    cb(null, fileName);
  },
});

const upload = multer({ storage });

// Veritabanı bağlantısını başlatmak için kullanılan bağlantı havuzu
const pool = new sql.ConnectionPool(config);

pool.connect()
  .then(() => {
    console.log('Veritabanı bağlantısı başarıyla kuruldu.');
  })
  .catch((err) => {
    console.error('Veritabanına bağlanırken hata:', err);
  });

// Tüm hizmet verilerini getir
Router.get('/get_image_data', async (req, res) => {
  try {
    const query = 'SELECT * FROM ImageData';
    const result = await pool.request().query(query);
    const ImageData = result.recordset;
    res.json({ ImageData });
  } catch (error) {
    console.error('Veri çekme hatası:', error);
    res.status(500).json({ error: 'Veri çekme hatası.' });
  }
});

// Yeni resim verisi eklemek
Router.post('/add_image_data', upload.single('image'), async (req, res) => {
  const uploadedImagePath = req.file.path;
  const startIndex = uploadedImagePath.indexOf('images');
  const result = uploadedImagePath.substring(startIndex);
  const Url = result.replace(/\\/g, '/');

  try {
    const query = `
      INSERT INTO ImageData (imgUrl) VALUES ('${Url}')
    `;
    await pool.request().query(query);
    console.log('Yeni resim başarıyla eklendi');
    res.json({ message: 'Yeni resim başarıyla eklendi.' });
  } catch (error) {
    console.error('Veri ekleme hatası:', error);
    res.status(500).json({ error: 'Veri ekleme hatası.' });
  }
});

// Resmi sil
Router.delete('/delete_image_data/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const getFilePathQuery = `SELECT imgUrl FROM ImageData WHERE id = ${id}`;
    const result = await pool.request().query(getFilePathQuery);

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'Resim bulunamadı.' });
    }

    const imgUrl = result.recordset[0].imgUrl;
    const Url = '../public/' + imgUrl;

    const query = `DELETE FROM ImageData WHERE id = ${id}`;
    await pool.request().query(query);

    fs.unlink(Url, (err) => {
      if (err) {
        console.error('Dosya silme hatası:', err);
        return res.status(500).json({ error: 'Dosya silme hatası.' });
      }
      console.log('Resim başarıyla silindi.');
      res.json({ message: 'Resim başarıyla silindi.' });
    });
  } catch (error) {
    console.error('Resim silme hatası:', error);
    res.status(500).json({ error: 'Resim silme hatası.' });
  }
});

module.exports = Router;
