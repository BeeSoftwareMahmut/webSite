const express = require('express');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const sql=require('mssql')
const Router=express.Router();



Router.use(bodyParser.urlencoded({ extended: true }));
Router.use(bodyParser.json())

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

// Bağlantı havuzunu başlat
const pool = new sql.ConnectionPool(config);

pool.connect()
  .then(() => {
    console.log('Veritabanı bağlantısı başarıyla kuruldu.');
  })
  .catch((err) => {
    console.error('Veritabanına bağlanırken hata:', err);
  });

  let adminMail=null
  let adminPassword=null

 const getInvalidAdmin=async()=>{
  try {
    const query = 'SELECT * FROM MailData where selected=1';
    const result = await pool.request().query(query);
    const MailData = result.recordset;
    adminMail=MailData[0].email;
    adminPassword=MailData[0].password;
  console.log(MailData)
    
  } catch (error) {
    console.error('Veri çekme hatası:', error);
    
  }

 } 



Router.post('/', async(req, res) => {
    const { name, email, phone, message } = req.body.post;
    await getInvalidAdmin();
  
    const transporter = nodemailer.createTransport({
      service: 'gmail', 
      auth: {
        user: adminMail,
        pass: adminPassword,
      },
    });


    const mailOptions = {
        from: email,
        to: adminMail, // Alıcı e-posta adresi
        subject: message,
        html: `
          <p>Ad Soyad: ${name}</p>
          <p>E-posta: ${email}</p>
          <p>Telefon: ${phone}</p>
          <p>Mesaj: ${message}</p>
        `,
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.log(error);
          res.send('Hata oluştu.'+ error);
        } else {
          console.log('E-posta gönderildi: ' + info.response);
          res.send('E-posta başarıyla gönderildi.');
        }
      });
    });

    module.exports=Router;
