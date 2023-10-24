const { logRegSchema, User } = require('../models/user');

const bcrypt = require('bcryptjs');

const jwt = require('jsonwebtoken')

const TOKEN_KEY = 'hashfhhjgh1k2h3kjho9999888'

const HttpErr = require('../helpers/HttpErr');

const { ctrlWrapper } = require('../helpers/ctrlWrapper');

const register = async (req, res) => {
    const {email, password} = req.body;
    const user = await User.findOne({ email });
    if (user) {
        throw HttpErr(409, 'Email already in use')
    }

    const hashPassword = await bcrypt.hash(password, 10)

    const newUser = await User.create({...req.body, password: hashPassword});

    res.status(201).json({
        email: newUser.email,
        subscription: newUser.subscription
    });
};

const login = async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
        throw HttpErr(401, 'Email or password invalide')
    };

    const comparePassword = await bcrypt.compare(password, user.password);

    if (!comparePassword) {
        throw HttpErr(401, 'Email or password invalide')
    };

    const payload = {
        id: user._id,
    };

    const token = jwt.sign(payload, TOKEN_KEY, {expiresIn: '23h'})

    res.json({
        token: token
    })
};

module.exports = {
    register: ctrlWrapper(register),
    login: ctrlWrapper(login),
};