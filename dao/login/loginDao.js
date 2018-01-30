"use strict";
var app = require('express')();
var baseDao = require("../baseDao.js");
var config = require('config');
var message = config.messages;
var httpResponseCodes = config.httpResponse;
var loginDao = function(){};
loginDao.prototype.getUsersList = function(data,cb){
    var connection = baseDao.getConnection(data);
    var query = "select * from admin";
  connection.query(query, function(err,result){
     if(err){
            return cb(message.internalServerError,httpResponseCodes.INTERNAL_SERVER_ERROR);
        }
        else{
         return cb(null,result);   
        }   
    })  
};
loginDao.prototype.addUser = function(data,cb){
    var userData = data.body;
    var connection = baseDao.getConnection(data);
    var query = 'INSERT INTO admin (userId, LastName, FirstName, mailId) VALUES("'+userData.userId+'","'+userData.userId+'","'+userData.FirstName+'","'+userData.mailId+'")';
  connection.query(query, function(err,result){
     if(err){
            return cb(message.internalServerError,httpResponseCodes.INTERNAL_SERVER_ERROR);
        }
        else{
         return cb(null,result);   
        }   
    })  
};

module.exports = loginDao;