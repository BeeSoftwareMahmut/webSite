const express = require('express');
const sql = require('mssql');
const multer = require('multer');
const fs = require('fs');
const servicesRouter = express.Router();

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

// Bağlantı havuzunu başlat
const pool = new sql.ConnectionPool(config);

pool.connect()
  .then(() => {
    console.log('Veritabanı bağlantısı başarıyla kuruldu.');
  })
  .catch((err) => {
    console.error('Veritabanına bağlanırken hata:', err);
  });

// Tüm hizmet verilerini getir
servicesRouter.get('/get_servicesData', async (req, res) => {
  try {
    const query = 'SELECT * FROM ServicesData';
    const result = await pool.request().query(query);
    const servicesData = result.recordset;
    res.json({ servicesData });
  } catch (error) {
    console.error('Veri çekme hatası:', error);
    res.status(500).json({ error: 'Veri çekme hatası.' });
  }
});

// Yeni hizmet verisi eklemek
servicesRouter.post('/services_data', upload.single('image'), async (req, res) => {
  const uploadedImagePath = req.file.path;
  const startIndex = uploadedImagePath.indexOf('images');
  const result = uploadedImagePath.substring(startIndex);
  const Url = result.replace(/\\/g, '/');
  const { title, description } = req.body;

  try {
    const query = `
      INSERT INTO ServicesData (imgUrl, title, description)
      VALUES ('${Url}', '${title}', '${description}')
    `;
    await pool.request().query(query);
    console.log('Yeni kayıt eklendi');
    res.json({ message: 'Yeni kayıt başarıyla eklendi.' });
  } catch (error) {
    console.error('Veri ekleme hatası:', error);
    res.status(500).json({ error: 'Veri ekleme hatası.' });
  }
});

// Hizmeti sil
servicesRouter.delete('/delete_servicesdata/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const getFilePathQuery = `SELECT imgUrl FROM ServicesData WHERE id = ${id}`;
    const result = await pool.request().query(getFilePathQuery);

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'Hizmet bulunamadı.' });
    }

    const imgUrl = result.recordset[0].imgUrl;
    const Url = '../public/' + imgUrl;

    const query = `DELETE FROM ServicesData WHERE id = ${id}`;
    await pool.request().query(query);

    fs.unlink(Url, (err) => {
      if (err) {
        console.error('Dosya silme hatası:', err);
        return res.status(500).json({ error: 'Dosya silme hatası.' });
      }
      console.log('Hizmet başarıyla silindi.');
      res.json({ message: 'Hizmet başarıyla silindi.' });
    });
  } catch (error) {
    console.error('Hizmet silme hatası:', error);
    res.status(500).json({ error: 'Hizmet silme hatası.' });
  }
});

module.exports = servicesRouter;
