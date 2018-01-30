"use strict";

var moduleName = __filename;
var app = require('express')();
var multer = require('multer');
var xlsx = require('xlsx');
var mkdirp = require('mkdirp');
var multerS3 = require('multer-s3');
var moment = require('moment');
var aws = require('aws-sdk');

/*s3 related conf*/
aws.config.region = 'will get in S3storagedetails.json';
aws.config.update({
    accessKeyId: 'will get in S3storagedetails.json',
    secretAccessKey: 'will get in S3storagedetails.json'
});
var s3 = new aws.S3();

var FileImportService = require('service/import/filrImportService.js');
var fileImportService = new FileImportService();


var localStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        var uploadDir = req.uploadContext;
        mkdirp(uploadDir, function (err) {
            if (err) {
                cb(null, uploadDir);
            } else {
                cb(null, uploadDir);
            }
        });
    },
    filename: function (req, file, cb) {
        var fileExtention = file.originalname.split('.');
        if (file.fieldname == 'logo') {
            var fileName = file.fieldname + '-' + Date.now() + '.' + fileExtention[fileExtention.length - 1];
            return cb(null, fileName);
        } else {
            var fileName = file.originalname;
            return cb(null, fileName);
        }
    }
});

var upload = multer({
    storage: localStorage
});
function fileServeMiddleware(fileAttributeName, uploadContext) {
     var tempUploadFilesPath = '../temp123/uploads/files';
     
    return function (req, res, next) {
        req.uploadContext = tempUploadFilesPath;
        req.fileAttributeName = fileAttributeName;
        req.filesArray = [];
        req.signedUrls = [];
        req.fileServer = req.headers.host;
        next();
    }
};

app.post('/',fileServeMiddleware('xlsFile','uploads/file'),upload.single('file'), function(req,res){
   fileImportService.uploadFile(req, function(err,result){
       if(err){
           res.send(err)
       }
       res.send(result);
   });
   
});

//for Document Uploads future reference for S3 credentials refere format in S3storagedetails


var s3upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: 's3Properties.bucket',
        metadata: function (req, file, cb) {
            var obj = {};
            if(req.body.description){
                req.body.description= req.body.description.replace(/’/g,"'");
                req.body.description= req.body.description.replace(/“/g,'"');
                req.body.description= req.body.description.replace(/”/g,'"');
            }
            obj = req.body;
            cb(null, obj);
        },
        key: function (req, file, cb) {
            var timeStamp = moment().format();
            var user = req.params.strategistId;
            var contextPath = req.uploadContext;
            if (file.fieldname == 'logo' && req.fileAttributeName == 'small') {
                var fileName = file.originalname.split('.');
                var fileExtention = '.' + fileName[fileName.length - 1];
                //var s3ObjectKey = s3Properties.root + user + '/' + contextPath + req.fileAttributeName + '/' + timeStamp + '/' + file.originalname; // req.params.strategistId+fileExtention;
                req.filesArray.push(s3ObjectKey)
                return cb(null, s3ObjectKey);
            } else if (file.fieldname == 'logo' && req.fileAttributeName == 'large') {
                var fileName = file.originalname.split('.');
                var fileExtention = '.' + fileName[fileName.length - 1];
                //var s3ObjectKey = s3Properties.root + user + '/' + contextPath + req.fileAttributeName + '/' + timeStamp + '/' + file.originalname; // req.params.strategistId+fileExtention;
                req.filesArray.push(s3ObjectKey)
                return cb(null, s3ObjectKey);
            } else if (req.params.modelId) {
                if(req.body.description){
                req.body.description.replace(/’/g,"'");
            }
                var originalFileName = file.originalname; //file.fieldname + '-' + Date.now()+'.'+fileExtention[fileExtention.length-1];
                var fileName = originalFileName.split('.');
                var fileExtention = '.' + fileName[fileName.length - 1];
                //var s3ObjectKey = s3Properties.root + 'model' + req.params.modelId + '/' + contextPath + timeStamp + '/' + originalFileName;
                req.filesArray.push(s3ObjectKey)
                return cb(null, s3ObjectKey);
            } else {
                var originalFileName = file.originalname; //file.fieldname + '-' + Date.now()+'.'+fileExtention[fileExtention.length-1];
                var fileName = originalFileName.split('.');
                var fileExtention = '.' + fileName[fileName.length - 1];
                //(as of now commented will get once get credentials)var s3ObjectKey = s3Properties.root + user + '/' + contextPath + timeStamp + '/' + originalFileName;
                req.filesArray.push(s3ObjectKey)
                return cb(null, s3ObjectKey);
            }
        }
    })
});

// not using this method but we can use in future if require ment came
app.post('/upload/document', fileServeMiddleware('document', 'documentModel/'), s3upload.array('document', 12), function (req, res) {
    
   // you can write code after uploading document using middleware you will get file or doc details in req.file 
});

module.exports = app;