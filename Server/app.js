
const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const aboutRouter=require("./aboutRouter");
const serviceRouter=require("./serviceRouter");
const mailRouter=require("./mailRouter");
const headerRouter=require("./headerRouter");
const LoginRouter=require("./loginRouter");
const VisionRouter=require("./visionRouter");
const ContactRouter=require("./contactRouter");
const SladeRouter=require("./sladeRouter");



app.use('/services', serviceRouter);
app.use('/about', aboutRouter);
app.use('/send_mail',mailRouter);
app.use('/header',headerRouter);
app.use('/login',LoginRouter);
app.use('/vision',VisionRouter);
app.use("/contact",ContactRouter);
app.use('/images',SladeRouter);




app.listen(port, () => {
  console.log(`Ana sunucu ${port} portunda çalışıyor.`);
});