const { Schema, model } = require('mongoose');

const Joi = require('joi');

const { handleMongooseError } = require('../helpers/handleMongooseError');

const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/

const userSchema = new Schema({
    password: {
        type: String,
        minlenght: 6,
        required: [true, 'Password is required'],
    },
    email: {
        type: String,
        match: emailRegex,
        required: [true, 'Email is required'],
        unique: true,
    },
    subscription: {
        type: String,
        enum: ["starter", "pro", "business"],
        default: "starter"
    },
    token: {
        type: String,
        default: null,
    },
    avatarUrl: {
        type: String,
        required: true
    },
    verify: {
        type: Boolean,
        default: false
    },
    verificationCode: {
        type: String,
        default: '',
    },
}, {
    versionKey: false,
});

userSchema.post('save', handleMongooseError);

const User = model('user', userSchema);

// JOI

const logRegSchema = Joi.object({
    email: Joi.string().pattern(emailRegex).required(),
    password: Joi.string().min(6).required()
});

const subscriptionSchema = Joi.object({
    subscription: Joi.string().valid('starter', 'pro', 'business').required()
});

const emailSchema = Joi.object({
    email: Joi.string().pattern(emailRegex).required()
});

module.exports = {
    User,
    logRegSchema,
    subscriptionSchema,
    emailSchema
};