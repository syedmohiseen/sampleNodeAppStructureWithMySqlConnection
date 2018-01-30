/**
 * Base Class, all DAOs should inherit this
 */
"use strict";

var moduleName = __filename;
var localCache = require('service/cache').cache;
var logger = require('helper/Logger')(moduleName);
var middlewareUtils = require('helper').middlewareUtils;
var _ = require('underscore');
var config = require('config');
var queryTimeout = 57000;

var BaseDao = function(){}

/**
 * 
 */
BaseDao.prototype.getConnection = function(data,userReadOnly){
	//allow the for mandatory read/write connection
	var mustUseReadWrite = false;

	//default connection based on data sent to getConnection()
	
	var reqRWObj = localCache.get(data.reqId),
			userReadInfo = {};

	userReadInfo.userReadonly = userReadOnly ;
	userReadInfo.readWriteConn = _.isEmpty(reqRWObj) ? {} : reqRWObj.connection,	

	//user requested read/write conneciton
	userReadInfo.mustUseReadWrite = (userReadOnly && userReadOnly === true) ? false: true;

	var getConnInfo = function(userReadInfo,query) {
		var isSelect = (query.substr(0,6).toLowerCase() == 'select')?true:false;

		var hasReadOnlyConn = !_.isEmpty(userReadInfo.readOnlyConn);
		var hasWriteConn = !_.isEmpty(userReadInfo.readWriteConn);

		// user requested readonly, readonly connection exists
		if((userReadInfo.userReadonly === true || isSelect) && hasReadOnlyConn && userReadInfo.mustUseReadWrite !== true) {
			logger.debug("Connection Used is Read Only");
			return userReadInfo.readOnlyConn;
		}
		// user requested read/write, read/write connections exists
		else if(hasWriteConn) {
			logger.debug("Connection Used is Read/Write");
			return userReadInfo.readWriteConn;
		}
		//well something went wrong
		return null;
	}

	if(_.isEmpty(userReadInfo.readOnlyConn) && _.isEmpty(userReadInfo.readWriteConn)){
	    return null;
	}
	else{	  
	  var tempConnection = {};
	  tempConnection.query = function(){
			
		  var args = arguments;
		  var json = {};
		  var query = args[0];
		  var cb = args[args.length-1];
		  var tcb = function(){
			  var args = arguments;
			  var error = args[0];
			  if(error && error.code == 'PROTOCOL_SEQUENCE_TIMEOUT'){
				  return cb.apply(this, ['Database Query is Taking too long to respond']);
			  }
			  return cb.apply(this, args);
		  }
		  if(typeof cb == "function"){
			  args[args.length-1] = tcb;
		  }
	  if(!data.ignoreQueryTimeOut)
		    json.timeout = queryTimeout;

			//figure out which connection to use
			var connection = getConnInfo(userReadInfo, query);

			//db name from connection
			var databaseName = connection.config.database;

		  json.sql = query;
		  args[0] = json;
		  logger.debug(data,"Executing following db query: " + query + " on Database: " + databaseName);
		  var sqlQuery = {};
			
			sqlQuery = connection.query.apply(connection, args);

		  logger.debug(data,"Executed following db query: " + sqlQuery.sql + " with threadId: " +connection.threadId+ " on Database: " + databaseName);
		  return sqlQuery; 
	  }
	  return tempConnection;
	}
}


/**
 * 
 */
BaseDao.prototype.getCommonDBConnection = function(data){
	return localCache.get(data.reqId).common;	
}

BaseDao.prototype.getCommunityDBConnection = function(data, userReadOnly){
	//allow the for mandatory read/write connection
	var mustUseReadWrite = false;

	//default connection based on data sent to getConnection()
	var reqROIdObj = localCache.get(data.reqROId);
	var reqRWObj = localCache.get(data.reqId);
			var userReadInfo = {};

	userReadInfo.userReadonly = userReadOnly ;
	userReadInfo.readOnlyConn = _.isEmpty(reqROIdObj) ? {}:reqROIdObj.connection;
        userReadInfo.readWriteConn = _.isEmpty(reqRWObj) ? {} : reqRWObj.community || reqRWObj.connection;	
    

	//user requested read/write conneciton
	userReadInfo.mustUseReadWrite = (userReadOnly && userReadOnly === true) ? false: true;

	var getConnInfo = function(userReadInfo,query) {
		var isSelect = (query.substr(0,6).toLowerCase() == 'select')?true:false;

		var hasReadOnlyConn = !_.isEmpty(userReadInfo.readOnlyConn);
		var hasWriteConn = !_.isEmpty(userReadInfo.readWriteConn);

		// user requested readonly, readonly connection exists
		if((userReadInfo.userReadonly === true || isSelect) && hasReadOnlyConn && userReadInfo.mustUseReadWrite !== true) {
			logger.debug("Connection Used is Read Only");
			return userReadInfo.readOnlyConn;
		}
		// user requested read/write, read/write connections exists
		else if(hasWriteConn) {
			logger.debug("Connection Used is Read/Write");
			return userReadInfo.readWriteConn;
		}
		//well something went wrong
		return null;
	}

	if(_.isEmpty(userReadInfo.readOnlyConn) && _.isEmpty(userReadInfo.readWriteConn)){
	    return null;
	}
	else{	  
	  var tempConnection = {};
	  tempConnection.query = function(){
			
		  var args = arguments;
		  var json = {};
		  var query = args[0];
		  var cb = args[args.length-1];
		  var tcb = function(){
			  var args = arguments;
			  var error = args[0];
			  if(error && error.code == 'PROTOCOL_SEQUENCE_TIMEOUT'){
				  return cb.apply(this, ['Database Query is Taking too long to respond']);
			  }
			  return cb.apply(this, args);
		  }
		  if(typeof cb == "function"){
			  args[args.length-1] = tcb;
		  }
	  if(!data.ignoreQueryTimeOut)
		    json.timeout = queryTimeout;

			//figure out which connection to use
			var connection = getConnInfo(userReadInfo, query);

			//db name from connection
			var databaseName = null;
			if(connection){
				databaseName = connection.config.database;
			}

		  json.sql = query;
		  args[0] = json;
		  logger.debug(data,"Executing following db query: " + query + " on Database: " + databaseName);
		  var sqlQuery = {};
			
			sqlQuery = connection.query.apply(connection, args);

		  logger.debug(data,"Executed following db query: " + sqlQuery.sql + " with threadId: " +connection.threadId+ " on Database: " + databaseName);
		  return sqlQuery; 
	  }
	  return tempConnection;
	}


	//return localCache.get(data.reqId).community;	
}


var getDbConnection;
BaseDao.prototype.getDbConnection = getDbConnection = function (req, cb) {
	// return new Promise(function(resolve, reject) {

	middlewareUtils.associateDBFirmConnectionWithReq(req, null, function (err, connection) {
		if (err) {
			logger.error("Error in function BaseDao.getDbConnection(). \n Error :" + err);
			return cb(err, null);
		}
		var cacheObj = localCache.get(req.reqId);
		var isConnectionWithoutTransaction = (cacheObj && cacheObj.isWithoutTransaction != undefined) ? cacheObj.isWithoutTransaction : false;
		//check to start connection without transaction
		if (!isConnectionWithoutTransaction) {
			middlewareUtils.startTransactionWithConnection(connection, function (err) {
				if (err) {
					logger.error("Error in function BaseDao.getDbConnection(). \n Error :" + err);
					return cb(err, null);
				} else {
					// resolve("Success!!!");
					return cb(null, "Success!!!");
				}
			});
		} else {
			logger.info("New connection created without Transaction .... Req:" + req);
			return cb(null, "Success!!!");
		}
	});
	// });
}
module.exports = new BaseDao();

/**
 * How to use
 *  var baseDao = require('dao/BaseDao.js'); 
 * 
 *  var firmConnection = baseDao.getConnection(data); //to get FirmSpecific connection
 *  var commonConnection = baseDao.getCommonDBConnection(data); // to get common DB connection
 */

