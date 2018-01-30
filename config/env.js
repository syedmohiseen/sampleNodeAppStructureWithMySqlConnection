"use strict";

var _ = require("lodash");

var PORT = 3001;
var isPropGiven = false;
//console.log("arguments",process.argv);
process.argv.forEach(function (val, index) {
//    console.log(val,index);
	var arg = val.split("=");
//        console.log(arg);
	if (arg.length > 0) {
		if (arg[0] === 'env') {

			var env = require('./env/' + arg[1] + '.json');
//              console.log(env);

			exports.prop = env;
			exports.name = arg[1];

			exports.sessionsecret = env.sessionsecret;

			PORT = env.port;
			isPropGiven = true;
		}else{
			/*
			 * for assigining other properties than env
			*/var obj = {};
                       
			obj[arg[0]] = arg[1];
              _.assign(exports.prop, obj);
		}

	}
});

if(!isPropGiven){

	var env = require('./env/local.json');

	exports.prop = env;
	exports.name = 'local';
	exports.prop["console-log"] = false;
	exports.sessionsecret = env.sessionsecret;

	PORT = env.port;
}

