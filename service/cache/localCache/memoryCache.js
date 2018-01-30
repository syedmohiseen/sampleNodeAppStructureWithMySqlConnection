"use strict";
var cache = require("memory-cache");
module.exports = {
    get: function(key){
        return cache.get(key);
    },
    put: function(key,value){
        return cache.put(key,value);
    },
    del: function(key){
        return cache.del(key);
    }
}


