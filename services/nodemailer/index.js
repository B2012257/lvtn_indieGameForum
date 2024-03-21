const nodemailer = require('nodemailer');
// Cấu hình nodemailer
const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: 'thaistar1998@gmail.com',
        pass: 'uruk nypr geuq exkv'
    }
});

module.exports = transporter