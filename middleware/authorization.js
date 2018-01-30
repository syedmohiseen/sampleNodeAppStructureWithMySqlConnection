"use strict";
var moduleName = __filename;
var JwtService = require('service/login/jwtService');
var jwtService = new JwtService();
exports.authorization = function () {
    var isAuthorized = function (req, res, next) {
        var authorizationHeaders = req.headers.authorization;
        if (authorizationHeaders) {
            var authorization = authorizationHeaders.split(' ');
            if (authorization[0] == "Session") {
                var token = authorization[1];
                if (token) {
                    req.token = token;
                    jwtService.verify(token, function (err, decoded) {
                        if (err) {
                            res.send("Invalid Authorization");
                        }
                        next();
                    });
                }
            } else {
                res.send("Invalid Authorization");
            }
        } else {
            res.send("Invalid Authorization");
        }
    };
    isAuthorized.unless = require("express-unless");

    return isAuthorized;
};