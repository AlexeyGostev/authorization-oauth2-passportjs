const oauth2orize = require('oauth2orize');
const passport = require('./passport');
const crypto = require('crypto');
const config = require('../config');
const User = require('../models/user');
const Client = require('../models/client');
const AccessToken = require('../models/accessToken');
const RefreshToken = require('../models/refreshToken');

const log = require('../libs/log')(module);
// create OAuth 2.0 server
const server = oauth2orize.createServer();

function generateToken(user, clientId, done) {
  new Promise((resolve, reject) => {
    AccessToken.remove({username : user.username}, (err) => {
      if (err) reject(err);
      resolve();
    });
  })
    .then(() => {
      return new Promise((resolve, reject) => {
        RefreshToken.remove({username : user.username}, (err) => {
          if (err) reject(err);
          resolve();
        });
      });
    })
    .then(() => {
      return new Promise((resolve, reject) => {
        let accessTokenValue = crypto.randomBytes(32).toString('hex');
        let accessToken = new AccessToken({
          username: user.username,
          clientId: clientId,
          token: accessTokenValue
        });
        accessToken.save((err) => {
          if (err) reject(err);
          resolve(accessTokenValue);
        });
      });
    })
    .then((accessTokenValue) => {
      log.info('3');
      return new Promise((resolve, reject) => {
        let refreshTokenValue = crypto.randomBytes(32).toString('hex');
        let refreshToken = new RefreshToken({
          username: user.username,
          clientId: clientId,
          token: refreshTokenValue
        });
        refreshToken.save((err) => {
          if (err) reject(err);
          resolve({
            at: accessTokenValue,
            rt: refreshTokenValue
          });
        });
      });
    })
    .then((tokens) => {
      done(null, tokens.at, tokens.rt);
    })
    .catch((err) => {
      log.error(err.message)
      done(err);
    });
}

// Exchange username & password for access token.
server.exchange(oauth2orize.exchange.password((client, username, password, scope, done) => {
  User.findOne({ username: username }, (err, user) => {
    if (err) {
      return done(err); 
    }
    if (!user) {
      return done(null, false, { message: 'Unknown user' });
    }
    if (!user.checkPassword(password)) {
      return done(null, false, { message: 'Incorrect password.' });
    }
    log.info(client.clientId);
    generateToken(user, client.clientId, done);

  });
}));

// Exchange refreshToken for access token.
server.exchange(oauth2orize.exchange.refreshToken((client, refreshToken, scope, done) => {
    RefreshToken.findOne({ token: refreshToken }, function(err, token) {
        if (err) {
          return done(err);
        }
        if (!token) {
          return done(null, false, { message: 'Incorrect token'});
        }
        User.findOne({ username: token.username }, (err, user) => {
          if (err) {
            return done(err);
          }
          if (!user) {
            return done(null, false);
          }
          generateToken(user, client.clientId, done);
        });
    });
}));


// token endpoint
exports.token = [
    passport.authenticate(['local', 'oauth2-client-password'], { session: false }),
    server.token(),
    server.errorHandler()
]