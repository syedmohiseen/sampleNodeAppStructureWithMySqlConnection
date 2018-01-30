"use strict";
//It will import all controllers in it

var moduleName = __filename;

module.exports = function(app){

	app.use('/v1', require('./v1.js'));
	

};

