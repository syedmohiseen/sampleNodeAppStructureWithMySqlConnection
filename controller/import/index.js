"use strict";

var app = require('express')();

app.use('/upload', require('./fileImportController'));

 module.exports = app;