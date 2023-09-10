const express = require('express');
const sql = require('mssql');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { Console } = require('console');
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
    cb(null, '/public/images/');
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
Router.get('/get_deneme', async (req, res) => {
  try {
    const query = 'SELECT img FROM deneme1';
    const result = await pool.request().query(query);
    const binaryData = result.recordset;
    res.json({ binaryData });
  } catch (error) {
    console.error('Veri çekme hatası:', error);
    res.status(500).json({ error: 'Veri çekme hatası.' });
  }
});

// Yeni hizmet verisi eklemek
Router.post('/deneme', upload.single('image'), async (req, res) => {
  const {image,name} = req.body;
  
  // Kaydedilecek dosyanın yolu
  const baseDirectory = 'C:\\Data\\images'; // Dosyanın kaydedileceği temel dizin
  const fileName = name; // Dosyanın adı

  // Dosyanın tam yolu
  const filePath = path.join(baseDirectory, fileName);
 

  // Blob URL'sini bir fiziksel dosyaya kaydetme
  const fileData = image.replace(/^data:image\/\w+;base64,/, '');
  const buffer = Buffer.from(fileData, 'base64');
  const ourPath = filePath.replace(/\\/g, '\\\\');
  // Dosyayı kaydet
  try {
    fs.writeFileSync(filePath, buffer);
    console.log('Resim başarıyla kaydedildi')
    
   
  } catch (error) {
    console.error('Dosya kaydedilirken bir hata oluştu:', error);
    console.log('Resim başarıyla kaydedilmedi')

  }
  

  try {
    const query = `
    INSERT INTO deneme1 (img) values
    ((SELECT * FROM OPENROWSET (BULK N'${ourPath}',Single_Blob)as T))
    `;
    await pool.request().query(query);
    console.log('Yeni resim eklendi');
    res.json({ message: 'Yeni resim başarıyla eklendi.' });
  } catch (error) {
    console.error('Veri ekleme hatası:', error);
    res.status(500).json({ error: 'Veri ekleme hatası.' });
  }
});

// Hizmeti sil
Router.delete('/delete_servicesdata/:id', async (req, res) => {
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

module.exports = Router;



