"use strict";
var moduleName = __filename;
var jwt = require('jsonwebtoken');
var JwtService = function() {};
var secret = "sampleTest";
JwtService.prototype.sign = function (data, cb) {
    var err = null;
    try {
        var token = jwt.sign({
  exp: Math.floor(Date.now() / 1000) + (60 * 60),
  data: data
}, secret);
    } catch (error) {
        err = error;
    }
    return cb(err, {'token':token,'expires_In':3600});
};

JwtService.prototype.verify = function(data, cb){
	jwt.verify(data, secret, cb);
};
module.exports = JwtService;


