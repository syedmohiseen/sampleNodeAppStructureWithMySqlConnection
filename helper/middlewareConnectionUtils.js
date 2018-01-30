"use strict";
var moduleName = __filename;
var mysql = require("mysql");
var localCache = require("service/cache").cache;
var logger = require("helper/logger")(moduleName);
var util = require('util');

module.exports = {
    getFirmDbConnection: function(req,res,cb){
        var reqId = req.reqId;
        var cacheObj = localCache.get(reqId);
       var poolCluster = localCache.get("poolCluster");
       if(!!poolCluster){
           poolCluster.getConnection("RWConnection", function(err, connection){
               if(err){
                   return err;
               }
               
               cacheObj.connection = connection;``
               cb(null,cacheObj.connection);
           });
       }
       else{
            cb("pool not Found");
        } 
    },
    startTransactionWithConnection: function(connection ,cb){
      connection.beginTransaction(function(err){
            if(err){
                logger.error(" Error in starting in transaction (startTransactionWithConnection())" + err);
                return cb(err);
            }
           	logger.info(" Start transaction successful (startTransactionWithConnection())");
            cb();
        });
  },
  finishTransactionWithConnection: function(connection,status,cb){
      var self = this;
      if(!status){
          connection.rollback(function(err){
              if(err){
                  return cb(err);
              }
              cb();
          });
      }else{
            connection.commit(function(err){
                if(err){
                    logger.error(" Error in committing transaction (finishTransactionWithConnection()) " + err);
                    return self.finishTransactionWithConnection(connection, false, function(){
                        return cb(err);
                    });
                }else{
                   	logger.info(" Finished Transaction successful (finishTransactionWithConnection())");
                    cb();
                }
            });
        }
          
  }
}
  