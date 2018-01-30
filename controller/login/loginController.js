"use strict";

var moduleName = __filename;

var app = require("express")();

var _ = require('lodash');
var LoginService = require('service/login/loginService.js');
var loginService = new LoginService();

app.get('/login', function (req, res) {
    loginService.getLoginToken(req, function (err, result) {
        res.send(result);
    });
});
app.get('/route', function (req, res) {    
    loginService.getusersList(req, function (err, result) {
        res.send(result);
    });
});
module.exports = app;

 