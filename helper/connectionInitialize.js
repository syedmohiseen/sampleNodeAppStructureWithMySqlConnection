"use strict";

var mysql = require("mysql");
var localCache = require("service/cache").cache;
var config = require("config");
var env = config.env.prop.sampleTest;
var poolCluster = mysql.createPoolCluster();
var dbConnect = {
    host: env.db.host,
    user: env.db.user,
    password: env.db.password,
    database: env.db.database
    };
poolCluster.add('RWConnection',dbConnect);
module.exports.poolCluster = poolCluster;