"use strict";

var moduleName = __filename;
var logger = require('helper/Logger.js')(moduleName);
var authorization = require('middleware/authorization.js').authorization;
var app = require("express")();
var response = require('controller/responseController');
var _ = require('lodash');
var LoginService = require('service/login/loginService.js');
var loginService = new LoginService();

app.get('/users', function (req, res) {    
    loginService.getusersList(req, function (err,status,result) {
        logger.info(result);
        return response(err,status,result,res);
    });
});

app.post('/users', function(req,res){
    var data =req;
  loginService.addUser(req, function(err,status,result){
     logger.info(result);
     return response(err,status,result,res);
  });
});
module.exports = app;