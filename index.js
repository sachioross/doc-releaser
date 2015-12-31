var Q = require('q');
var nconf = require('nconf');
var fs = require('fs');
var moment = require('moment');
var args = require('optimist').argv;
var help = "This would be help text";
var Q_FS = require('q-io/fs');

/* 
    Basic configuration. 
    This module expects a "config.json" file in the 
    same diretory as the file to be renamed. If not found, 
    these defaults will be used
*/

var CUR_FOLDER = "currentFolder";
var PREV_FOLDER = "previousFolder";
var DATE_PATTERN = "datePattern";
var FILE_PATTERN = "fileNamePattern";
var CONF_FILE = "./config.json";
var ROOT = "./";
var SLASH = "/";

var configDefaults = {
    "datePattern" : "YYYYMMDDHHmm",
    "fileNamePattern" : "${TS}DR-KP-${fileName}",
    "currentFolder" : "current",
    "previousFolder" : "previous"
}

nconf.defaults(configDefaults);

/**
    Simple check function to ensure 
    that at least a file name has been 
    provided
*/
function checkArgs() {
    
    var fileName;
    if (args._[0]) {
        fileName = args._[0];
    } else {
        console.log("A file must be provided");
        process.exit(0);
    }
    
    return fileName;
}


/**
    Prerequisite function to ensure 
    a configuration is set or defaults provided.
*/ 
function checkForConfig() {
    
    var deferred = Q.defer();
    
    Q.nfcall(fs.stat, CONF_FILE)
        .then(function(stat) {
            if (stat.isFile()) {
                nconf.file(CONF_FILE);
                deferred.resolve("Found");
            }
        })
        .catch(function(error) {
            // TODO: Factor for other errors than "not found"
            console.log("Error with stat: " + error);
            deferred.resolve("Not found, using defaults");
        })
        .done();
    
    return deferred.promise;
    
}


/**
    Prerequisite function to ensure proper folders 
    are present or created if not present.
*/
function checkForOrCreateFolders() {
    
    var deferred = Q.defer();
    
    Q.all([createFolderIfNotExisting(nconf.get(PREV_FOLDER)), 
           createFolderIfNotExisting(nconf.get(CUR_FOLDER))])
        .catch(function(error) {
            console.log(error);
        })
        .done(function(result) {
            deferred.resolve("Finished" + result);
        });
    
    return deferred.promise;
}

/**
    Process function to perform move of last release 
    to previous folder
*/
function moveCurrentToPrevious() {
    
    var deferred = Q.defer();
    
    Q.nfcall(fs.readdir, nconf.get(CUR_FOLDER))
        .then(function(children) {
        
            if (children.length > 1) {
                console.log("There should only be one file in this folder");
            } else if (children.length < 1) {
                console.log("No existing file found");
            }
        
            for (child in children) {
                
                var file = children[child];
                var sourcePath = ROOT + 
                    nconf.get(CUR_FOLDER) + 
                    SLASH +
                    file;
                var targetPath = ROOT + 
                    nconf.get(PREV_FOLDER) + 
                    SLASH + 
                    file;
                
                fs.renameSync(sourcePath, targetPath);    
            }
        
            deferred.resolve("File moved");
        
        }).catch(function(error) {
            console.log("error" + error);
            deferred.reject(error);
        })
        .done();
    
    return deferred.promise;
}

/**
    Processing function to create new release
    using file naming convention
*/
function createNewRelease(fileName) {

    console.log("Creating new release for file: " + fileName);
    
    var ts = moment().format(nconf.get(DATE_PATTERN));
    
    var newFileName = nconf.get(FILE_PATTERN)
        .replace("${TS}", ts)
        .replace("${fileName}",fileName);
    
    
    return Q_FS.copy(fileName, ROOT + nconf.get(CUR_FOLDER) + SLASH + newFileName);
}

/**
    Utility function utilized in the pre-requisite 
    function checkForOrCreateFolders.
*/
function createFolderIfNotExisting(folderName) {
    
    var deferred = Q.defer();
    
    Q.nfcall(fs.stat, folderName)
        .then(function(stat) {
            deferred.resolve(folderName + " exists");
        })
        .catch(function(error) {
            // TODO: Factor for more than non-existing
            fs.mkdirSync(folderName);
            deferred.resolve("Created " + folderName);
        })
    
    return deferred.promise;
}

// Execution
Q.fcall(checkArgs)
    .catch(function(error) { console.log("Error here: " + error); })
    .done(function(fileName) {
        Q.all([checkForConfig(), checkForOrCreateFolders()])
            .catch(function(e) {    
                console.log(e);
            })
            .done(function(result) { 

                moveCurrentToPrevious()
                    .then(createNewRelease(fileName))
                    .catch(function(error) { console.log(error); })
                    .done(function(status) { console.log("Done"); });
            });
    });
