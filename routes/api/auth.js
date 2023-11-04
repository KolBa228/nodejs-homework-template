const express = require('express');

const { authenticate, validateBody, upload } = require('../../midlleware');

const { logRegSchema, subscriptionSchema, emailSchema } = require('../../models/user');

const ctrl = require('../../controllers/auth');
const { verify } = require('jsonwebtoken');

const router = express.Router();

router.post('/register', validateBody(logRegSchema), ctrl.register);

router.get('/verify/:verificationCode', ctrl.verifyEmail);

router.post('/verify', validateBody(emailSchema), ctrl.resendVerifyEmail);

router.post('/login', validateBody(logRegSchema), ctrl.login);

router.post('/logout', validateBody(logRegSchema), ctrl.logOut)

router.get('/', authenticate, ctrl.getCurrent);

router.patch('/change/subscription', validateBody(subscriptionSchema), authenticate, ctrl.updateSubscription);

router.patch('/avatar', authenticate, upload.single('avatar'), ctrl.setAvatar);

module.exports = router;