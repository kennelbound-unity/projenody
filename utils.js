'use strict';

var fs = require('fs');
var exec = require('child_process').execSync;
var path = require('path');
var os = require('os');
var logger = require('./log');
var mkdirp = require('mkdirp');

function runSimple(cmd, callback) {
    logger.debug('Executing the command `' + cmd + '`');
    try {
        var stdout = exec(cmd, [], {stdio: 'inherit'});
        if (callback) callback(false, stdout);
    }
    catch (e) {
        logger.error(e);
        if (callback) callback(true, e)
    }
    logger.debug('Completed executing `' + cmd + '`');
}

//function will check if a directory exists, and create it if it doesn't
function checkDirectorySync(directory) {
    directory = path.normalize(directory);
    if (!fs.existsSync(directory)) {
        logger.info("Creating needed folder " + directory);
        mkdirp.sync(directory);
    }
}

function isSymlinkSync(filepath) {
    if (typeof filepath !== 'string') {
        throw new TypeError('expected filepath to be a string');
    }
    try {
        var stats = fs.lstatSync(path.resolve(filepath));
        return stats.isSymbolicLink();
    } catch (err) {
        if (err.code === 'ENOENT') {
            return false;
        }
        throw err;
    }
}

function createLink(source, target) {
    source = path.normalize(source);
    target = path.normalize(target);

    logger.debug('Checking link between source ' + source + " and target " + target);

    // checkDirectorySync(target);

    if (fs.existsSync(target) && isSymlinkSync(target)) {
        logger.debug("Target already exists and is a symlink.");
    } else {
        logger.debug("Attempting to link " + source + " to " + target + " on platform " + os.platform());

        // fs.symlinkSync(source, target);

        switch (os.platform()) {
            case 'windows':
            case 'win32':
            case 'win64':
                runSimple('mklink /J ' + target + ' ' + source);
                // fs.symlink(target, source, 'junction');
                break;
            default:
                runSimple('ln -s ' + source + ' ' + target);
            // fs.symlink(source, target);
        }

        logger.debug("Linked " + source + " to " + target);
    }
}

function packageProjenodyFile(pkg) {
    return path.normalize(packageFolder() + '/projenody.json');
}

function packageFolder(pkg) {
    return path.normalize(pkg.isMain ? process.cwd() : process.cwd() + '/node_modules/' + pkg.name);
}

module.exports = {
    runSimple: runSimple,
    checkDirectory: checkDirectorySync,
    createLink: createLink,
    packageProjenodyFile: packageProjenodyFile,
    packageFolder: packageFolder
};