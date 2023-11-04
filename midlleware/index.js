const authenticate = require('./authenticate');
const ctrlWrapper = require('./ctrlWrapper');
const validateBody = require('./validateBody');
const isValidId = require('./isValidId');
const upload = require('./multer')
const sendEmail = require('./sendEmail')

module.exports = {
    authenticate,
    ctrlWrapper,
    validateBody,
    isValidId,
    upload,
    sendEmail
};