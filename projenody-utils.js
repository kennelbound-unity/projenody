'use strict';

var fs = require('fs');

//function will check if a directory exists, and create it if it doesn't
function checkDirectory(directory, callback) {
    if (!fs.existsSync(directory)) {
        console.log("Creating needed folder %s", directory);
        fs.mkdirSync(directory);
    }
}

function createLink(source, target) {
    if (fs.existsSync(target)) {
        console.log("Skipping %s to %s link.  Target already exists.", source, target);
    } else {
        console.log("Attempting to link %s to %s", source, target);
        // TODO: Wrap this in a try/catch
        fs.symlinkSync(source, target, 'junction');
        console.log("Linked %s to %s", source, target);
    }
}

function packageProjenodyFile(pkg) {
    return packageFolder() + '/projenody.json';
}

function packageFolder(pkg) {
    return process.cwd() + '/node_modules/' + pkg.name;
}

module.exports = {
    checkDirectory: checkDirectory,
    createLink: createLink,
    packageProjenodyFile: packageProjenodyFile,
    packageFolder: packageFolder
};