"use strict";
var memory = require("./memoryCache.js");

module.exports = {
    get: function(key){
        return memory.get(key);
    },
    put: function(key,value){
        return memory.put(key,value);
    },
    del: function(key){
        return memory.del(key);
    }
};


