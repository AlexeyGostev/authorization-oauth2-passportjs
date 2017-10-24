const express = require('express');
const path = require('path');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const log = require('./libs/log')(module);
const passport = require('./auth/passport.js');

const oauth2 = require('./auth/oauth2');
const token = require('./routes/token');

const app = express();

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(passport.initialize());

app.use('/token', token);
//app.use('/login', passport.authenticate('local', { session: false }),);
app.get('/test', passport.authenticate('bearer', { session: false }),
	(req, res) => {
		res.json('test');
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
	let err = new Error('Not Found');
	err.status = 404;
	next(err);
});

// error handler
app.use(function(err, req, res, next) {
	res.status(err.status || 500);
	res.end(err.message);
});

module.exports = app;
