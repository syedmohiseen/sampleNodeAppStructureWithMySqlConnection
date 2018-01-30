"use strict";
var moduleName = __filename;
var dbConnection = require('./dbConnection.js');
var uniqueId = require("service/uniqIdGenerator").uniqueId;
var localCache = require("service/cache").cache;
var authorization = require('./authorization.js').authorization;
var JwtService = require('service/login/jwtService.js');
var jwtService = new JwtService();

module.exports = function (app) {
    var apiWithoutAuthorization = [
        new RegExp('^\/v1\/login(\/)?$', 'i')
    ];
    app.use(function (req, res, next) {
        var id = uniqueId.get();
        req.reqId = id;
        var cacheObject = {};
        localCache.put(id, cacheObject);
        res.on('finish', function () {
            localCache.del(id);
        });
        next();
    });
    
    app.use(authorization().unless({path: apiWithoutAuthorization}));
    app.use(dbConnection.firm().unless({path: apiWithoutAuthorization}));
};