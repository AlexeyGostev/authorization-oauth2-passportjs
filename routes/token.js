const express = require('express');
const passport = require('../auth/passport');
const router = express.Router();
const log = require('../libs/log')(module);
const oauth2 = require('../auth/oauth2');


const AccessToken = require('../models/accessToken');
const RefreshToken = require('../models/refreshToken');

router.post('/', oauth2.token);

module.exports = router;