var moduleName = __filename;


var app = require('express')();
var _ = require('lodash');
var jwt = require('jsonwebtoken');
var JwtService = require('service/login/jwtService.js');
var jwtService = new JwtService();
var importService = function () {};
var secret = 'sampleApplication';
var xlsx = require('xlsx');
var fs = require('fs');


/***
 * USED to UPLOAD TO SERVER
 * PLEASE refer S3storagedetails.json for uploading to S3, for ur reference
 * upload to s3 here and return uploaded response to ui
 * var fileLocation = req.file.path;
  var s3path = s3Properties.root + req.params.strategistId + '/' + req.file.fieldname + '/' + timeStamp + '/' + req.file.originalname;
            var fileData = fs.createReadStream(fileLocation);
            var signedUrlExpireTime = constants.TOKEN_EXPIRES_IN;
            var params = {
              Bucket: s3Properties.bucket,
              Key: s3path(give the path where we want to store in S3),
              Expires: signedUrlExpireTime,
              Body: fileData
            };
//this method will upload to server
            s3.upload(params, function(err, data) {
              if (err) {
                logger.error("Error uploading data: ", err);
              } else {
                logger.info("Successfully uploaded to s3 : "+JSON.stringify(data));
                 //you can do some insert query or further after upload to S3.

              }
            });

*/
importService.prototype.uploadFile = function (data, cb) {
    var self = this;
    var fileLocation = data.file.path;
    self.importFile(data, fileLocation, function (err, fileData) {
        if (err == 'when we get any error ') {
            //delete uploaded file on local 
            fs.unlinkSync(fileLocation);
            return cb(err);
        }
        //if every thing is fine will upload to server reference code is mentioned in commented lines(LineNo: 16)
        
        //sending converted JSON data in response
        return cb(fileData);
    });

};

importService.prototype.importFile = function (data, fileLocation, cb) {

    validateHeaderData(fileLocation, function (err, result) {
        if (err) {
            return cb(err);
        }
    /*
       * using javascript parsing xlsx data to JSON conversion for reference as of now commented and using below method parseXlsxDataToJson
       * 
        parseXlsxDataToJsonUsingJavascript(fileLocation, function (err, result) {
            if (err) {
                return cb(err);
            }
            return cb(result);
        });
        
        **/
        
     /*
         * using node XLSX module short term
         * **/
        parseXlsxDataToJson(fileLocation, function (err, result) {
            if (err) {
                return cb(err);
            }
            return cb(null,result);
            //arrange data in order and insert in dataBase  will be used in future
            /***
            if(result){
                //arrange data in order
                prepareData(result, function(err, formatedData){
                    if(err){
                      return cb(err);  
                    }
                    return cb(result);
                });
            }
            */
        });
    });

};

function validateHeaderData(fileLocation, cb) {
    var fileData = xlsx.readFile(fileLocation);
    var workBook = fileData.SheetNames[0];
    var getFileData = fileData.Sheets[workBook];
    var errArr = [];
    var fileHaederArray = [];
    for (var headerData in getFileData) {
        if (headerData == 'A2') {
            break;
        }
        if (headerData == '!ref') {
            continue;
        }
        if (getFileData[headerData].v == undefined) {
            errArr.push({
                "error": "Missing heading in Sheet name : " + workBook + "on first row"
            });
            continue;
        }
        fileHaederArray.push(getFileData[headerData].v)
    }
    if (errArr.length > 0) {
        return cb(errArr);
    }
    return cb(null, fileHaederArray);
}
;
// using javaScript converting to JSON format
function parseXlsxDataToJsonUsingJavascript(fileLocation, cb) {
    var fileData = xlsx.readFile(fileLocation);
    var data = [];
    var getColumnData = fileData.SheetNames;
    getColumnData.forEach(function (item) {
        var eachData = fileData.Sheets[item];
        var headers = {};

        for (var z in eachData) {
            if (z[0] === '!')
                continue;
            //parse out the column, row, and value
            var col = z.substring(0, 1);
            var row = parseInt(z.substring(1));
            var value = eachData[z].v;

            //store header names
            if (row == 1) {
                headers[col] = value;
                continue;
            }

            if (!data[row])
                data[row] = {};
            data[row][headers[col]] = value;
        }
        //drop those first two rows which are empty
        data.shift();
        data.shift();
        console.log(data);
        return cb(null, data);
    });

}
;
// the below method is short for getting XLS data to JSON format
function parseXlsxDataToJson(fileLocation, cb) {
    var workBook = xlsx.readFile(fileLocation);
    var first_sheet_name = workBook.SheetNames[0];
    //default method exist in XLSX node module
    var roa = xlsx.utils.sheet_to_row_object_array(workBook.Sheets[first_sheet_name]);
    var error = {};
    if (roa.length == 0) {
        error.message = "Empty file found.";
        return cb([error]);
    }
    return cb(null, roa);
};

function prepareData(data, cb){
    var errorMsg = [];
    var arrangeEachData = _.forEach(data,function(item){
        var modelName = _.filter(data,{'Model Name':item['Model Name']})
        var gettargetLowerPer = _.filter(modelName,{'Target Risk Lower(%)': modelName[0]['Target Risk Lower(%)'] })
        var gettargetUpperPer = _.filter(modelName,{'Target Risk Upper(%)': modelName[0]['Target Risk Lower(%)'] })
        if((modelName.length != gettargetLowerPer.length) || (modelName.length != gettargetUpperPer.length)){
           errorMsg.push('percentages should be same'); 
        }
    });
    console.log(arrangeEachData);
};

importService.prototype.getusersList = function (data, cb) {
    var data = "Success";
    return cb(null, data);
};
module.exports = importService;