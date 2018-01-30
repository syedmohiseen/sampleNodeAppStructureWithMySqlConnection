"use strict";
var app = require('express')();
console.log('loginController');
app.use(require('./loginController.js'));
app.use('/users',require('./userController.js'));

module.exports = app;