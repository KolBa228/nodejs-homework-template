const { User } = require('../models/user');

const bcrypt = require('bcryptjs');

const { nanoid } = require('nanoid');

const fs = require('fs');

const gravatar = require('gravatar');

const path = require('path');

const avatarsPath = path.join(__dirname, '../', 'public', 'avatars');

const jwt = require('jsonwebtoken');

const TOKEN_KEY = 'hashfhhjgh1k2h3kjho9999888'

const HttpErr = require('../helpers/HttpErr');

const { ctrlWrapper, sendEmail } = require('../midlleware');

const subscriptionSchema = require('../models/user')

const register = async (req, res) => {
    const {email, password} = req.body;
    const user = await User.findOne({ email });
    if (user) {
        throw HttpErr(409, 'Email already in use')
    }

    const hashPassword = await bcrypt.hash(password, 10);
    const avatarUrl = gravatar.url(email);
    const verificationCode = nanoid();

    const newUser = await User.create({ ...req.body, password: hashPassword, avatarUrl, verificationCode });
    const verifyEmail = {
        to: email,
        subject: 'Verify email',
        html: `<a target='_blank' href='https://localhost:3000/api/auth/verify${verificationCode}'>Click to verify your email</a>`
    };

    await sendEmail(verifyEmail);

    res.status(201).json({
        email: newUser.email,
        subscription: newUser.subscription
    });
};

const verifyEmail = async (req, res) => {
    const { verificationCode } = req.params;
    const user = User.findOne({ verificationCode })
    if (!user) {
        throw HttpErr(401, 'Email not found')
    }
    await User.findByIdAndUpdate(user._id, { verify: true, verificationCode: '' });
    res.json({
        message: 'Email verified success'
    });
};

const resendVerifyEmail = async (req, res) => {
    const { email } = req.body;
    const user = User.findOne({ email });
    if (!user) {
        throw HttpErr(401, 'Email not found')
    };
    if (user.verify) {
        throw HttpErr(401, 'Email already verified')
    };
    const verifyEmail = {
        to: email,
        subject: 'Verify email',
        html: `<a target='_blank' href='https://localhost:3000/api/auth/verify${user.verificationCode}'>Click to verify your email</a>`
    };
    await sendEmail(verifyEmail);
}

const login = async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
        throw HttpErr(401, 'Email or password invalide')
    };

    if (!user.verify) {
        throw HttpErr(401, 'Email or password invalide')
    };

    const comparePassword = await bcrypt.compare(password, user.password);

    if (!comparePassword) {
        throw HttpErr(401, 'Email or password invalide')
    };

    const payload = {
        id: user._id,
    };

    const token = jwt.sign(payload, TOKEN_KEY, { expiresIn: '23h' })

    await User.findByIdAndUpdate(user._id, {token})

    res.json({
        token: token
    })
};

const getCurrent = async (req, res) => {
    const { email, subscription } = req.user;
    res.json({
        email,
        subscription
    })
};

const logOut = async (req, res) => {
    const { _id } = req.user;
    await User.findByIdAndUpdate(_id, { token: '' })
    
    res.json({
        message: 'Logout success'
    })
};

const changeSubscription = async (req, res, next) => {

    const { email } = req.user;
    const { newSubscription } = req.body;

    try {
        if (!["starter", "pro", "business"].includes(newSubscription)) {
            throw new HttpErr(400, 'Invalid subscription');
        }

        const user = await User.findOne({ email });

        if (!user) {
            throw new HttpErr(404, 'User not found');
        }

        user.subscription = newSubscription;
        await user.save();

        res.json({
            message: 'Subscription changed successfully',
            newSubscription: user.subscription
        });

    } catch (error) {
        next(error);
    }
};

const updateSubscription = async (req, res) => {
    const { error } = subscriptionSchema.validate(req.body);
    if (error) {
        throw new HttpErr(400, 'Invalid subscription');
    }

    const { email } = req.user;
    const user = await User.findOne({ email });

    if (!user) {
        throw new HttpErr(404, 'User not found');
    }

    const updatedUser = await User.findOneAndUpdate(
        { email },
        { subscription: req.body.subscription },
        { new: true }
    );

    if (!updatedUser) {
        throw new HttpErr(500, 'Failed to update subscription');
    }

    res.json(updatedUser);
};

const setAvatar = async (req, res) => {
    const { _id } = req.user;
    
    const { path: tempUpload, originalName } = req.file;

    const filename = `${_id}_${originalName}`;

    const resultUpload = path.join(avatarsPath, filename);

    await fs.rename(tempUpload, resultUpload);

    const avatarUrl = path.join('avatars', filename);

    await User.findByIdAndUpdate(_id, { avatarUrl });

    res.json({
        avatarUrl
    })
};

module.exports = {
    register: ctrlWrapper(register),
    verifyEmail: ctrlWrapper(verifyEmail),
    resendVerifyEmail: ctrlWrapper(resendVerifyEmail),
    login: ctrlWrapper(login),
    getCurrent: ctrlWrapper(getCurrent),
    logOut: ctrlWrapper(logOut),
    changeSubscription: ctrlWrapper(changeSubscription),
    updateSubscription: ctrlWrapper(updateSubscription),setAvatar: ctrlWrapper(setAvatar)
};