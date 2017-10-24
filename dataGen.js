var log                 = require('./libs/log')(module);
var mongoose            = require('./libs/mongoose');
var UserModel           = require('./models/user');
var ClientModel         = require('./models/client');
//var AccessTokenModel    = require('./models/accessToken');
//var RefreshTokenModel   = require('./models/refreshToken');

UserModel.remove({}, function(err) {
    var user = new UserModel({ username: "lox", password: "lox" });
    user.save(function(err, user) {
        if(err) return log.error(err);
        else log.info("New user - %s:%s",user.username,user.password);
    });
});

ClientModel.remove({}, function(err) {
    var client = new ClientModel({ clientName: "OurService iOS client v1", clientId: "lox1", clientSecret:"lox1" });
    client.save(function(err, client) {
        if(err) return log.error(err);
        else log.info("New client - %s:%s",client.clientId,client.clientSecret);
    });
});
/*
AccessTokenModel.remove({}, function (err) {
    if (err) return log.error(err);
});
RefreshTokenModel.remove({}, function (err) {
    if (err) return log.error(err);
});*/

setTimeout(function() {
    mongoose.disconnect();
}, 3000);