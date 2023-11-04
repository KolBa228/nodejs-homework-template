const nodemailer = require('nodemailer');

const MPASSWORD = '1111111111';

const nodemailerConfig = {
    host: 'smtp.meta.ua',
    port: 465,
    secure: true,
    auth: {
        user: 'nikolayitdev@meta.ua',
        pass: MPASSWORD
    }
};

const transport = nodemailer.createTransport(nodemailerConfig);

const email = {
    to: '',
    from: 'nikolayitdev@meta.ua',
    subject: 'Test',
    html: '<p>Test test test test test test test</p>'
};

module.exports = {
    transport,
    email
};
