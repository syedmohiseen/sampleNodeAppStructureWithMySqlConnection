"use strict";
var moduleName = __filename;
var localCache = require('service/cache').cache;
var app = require('express')();
var cache = require("service/cache").cache; 
var logger = require('helper/Logger.js')(moduleName);
var mysql = require("mysql");
var config = require('config');
var connectionInitialize = require("helper/connectionInitialize.js");
var middlewareConnectionUtils = require("helper").middlewareConnectionUtils;
var env = config.env.prop.sampleTest;
var poolCluster = mysql.createPoolCluster();

//Here we are appending req.body data in data object
function prepareRequestData(req) {
	var body = req.body;
	var queryData = req.query;
	var data = req.data ? req.data : (req.data={}); 
	for (var key in body) {
		if (body.hasOwnProperty(key)) {
			var value = body[key];
			data[key] = value;
		}
	}
	for(var key in queryData) {
		var value = queryData[key];
		data[key] = value;
	}

	req.data = data;
	
}

exports.firm = function () {
	var firmDbMiddleware = function(req, res, next){
		var reqId = req.reqId;
		var cacheObject = cache.get(reqId);
         //on req finish we are closing the transaction
		res.on('finish', function finish() {
			requestFinishCleanupForFirm(reqId, cacheObject, res, function(){
				
			});
		});
		res.on('close', function finish() {
			requestFinishCleanupForFirm(reqId, cacheObject, res, function(){
			});
		});
		middlewareConnectionUtils.getFirmDbConnection(req, res, function(err, connection){
			if(err) {
				return err;
			}
			middlewareConnectionUtils.startTransactionWithConnection(connection, function(err){
				if(err){
//					
					return err;
				}else{
					next();
				}
			});
		});
		/*
		 * potential risk here for more number of keys in data
		 */
		prepareRequestData(req);
	};

	firmDbMiddleware.unless = require("express-unless");
	return firmDbMiddleware;
};

function requestFinishCleanupForFirm(reqId, cacheObject, res, cb){
    //If status 500 error or 422 error will rollback that transaction
	var status = res.statusCode !== 500 && res.statusCode !== 422;
	var connection = cacheObject.connection;
	if(!!connection){
		middlewareConnectionUtils.finishTransactionWithConnection(connection, status, function(err){
			logger.info(" Releasing Firm connection with threadId - " + connection.threadId);
			connection.release();
			localCache.del(reqId);
			cb(err);
		});
	}
	
}

