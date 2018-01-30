"use strict";
var shortid = require('shortid');

var uniqueId = shortid.generate();
module.exports = {
    get: function(){
       return shortid.generate(); 
    }
};
//module.exports = uniqueId;