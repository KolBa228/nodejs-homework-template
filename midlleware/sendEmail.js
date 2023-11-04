const { transport } = require('../helpers/nodemailer');

const sendEmail = async (verifyEmail) => {
    const info = await transport.sendMail(verifyEmail);
    return info
};

module.exports = sendEmail