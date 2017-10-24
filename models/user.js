const crypto = require('crypto');
const log = require('../libs/log.js')(module);

const HttpError = require('../errors').HttpError;
const AuthError = require('../errors').AuthError;
const mongoose = require('../libs/mongoose');
const Schema = mongoose.Schema;

let schema = new Schema({
    username: {
        type: String,
        unique: true,
        required: true
    },
    hashedPassword: {
        type: String,
        required: true
    },
    salt: {
        type: String,
        required: true
    },
    created: {
        type: Date,
        default: Date.now
    }
});

schema.virtual('password')
    .set(function(password) {
        this._plainPassword = password;
        this.salt = crypto.randomBytes(32).toString('base64');
        //more secure - this.salt = crypto.randomBytes(128).toString('base64');
        this.hashedPassword = this.encryptPassword(password);
    })
    .get(function() { return this._plainPassword; });

schema.methods.encryptPassword = function(password) {
    return crypto.createHmac('sha1', this.salt).update(password).digest('hex');
    //more secure - return crypto.pbkdf2Sync(password, this.salt, 10000, 512);
};

schema.methods.checkPassword = function(password) {
    return this.encryptPassword(password) === this.hashedPassword;
};

let User = mongoose.model('User', schema);
module.exports = User;