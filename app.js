"use strict";
global.appBasePath = __dirname;

require('app-module-path').addPath(appBasePath);

var express = require('express');
var moduleName = __filename;
var morgan = require('morgan');
var bodyParser = require('body-parser');
var http = require('http');
var config = require('config');
var logger = require('helper/Logger.js')(moduleName);
require("service/dbPool/dbPoolLoadInit.js");
var PORT = config.env.prop.port;
var app = express();
var server = http.Server(app);
var jwt = require('jsonwebtoken');


app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

 appStart(app);

 function appStart(app){
     require('middleware')(app);
	require('controller')(app);
	
app.listen(PORT || 3001);
console.log('server is located at: ',PORT);
 }

process.on('uncaughtException', function(err){
	console.log(" FATAL" + err);
	console.trace("FATAL", err);
	
	var cb = function(){
		process.exit(1);		
	}
});