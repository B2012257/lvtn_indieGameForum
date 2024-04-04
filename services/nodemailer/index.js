const nodemailer = require('nodemailer');
// Cấu hình nodemailer
const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: 'thaistar1998@gmail.com',
        pass: 'nijj yued exwr apby'
    }
});

module.exports = transporter