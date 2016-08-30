#!/usr/bin/env node

require('pkginfo')(module, 'version');
var fs = require('fs');
var jsonfile = require('jsonfile');
var path = require('path');
var logger = require('./log');

var utils = require('./utils');
var ProjenodyPackage = require('./projenody-package');

function writeProjenodyPackage(pkg) {
    jsonfile.writeFile(path.normalize(pkg.packageProjenodyFile), pkg, function (error) {
        if (error) {
            logger.error("Could not write projenody.json file.  Error: " + JSON.stringify(error));
            process.exit(1);
        }
        logger.info("Generated the projenody file at " + process.cwd());
    });
}

function getProjenodyPackage(directory) {
    try {
        var p = require(path.normalize(directory + '/projenody.json'));
        var npmPackage = require(path.normalize(directory + '/package.json'));
        p.name = npmPackage.name;
        return new ProjenodyPackage(p);
    } catch (e) {
        return null;
    }
}

function initProjenodyPackage(pkg) {
    if (pkg) {
        return;
    }

    try {
        var obj = jsonfile.readFileSync(path.normalize(process.cwd() + '/package.json'));
        pkg = new ProjenodyPackage({name: obj.name});
        pkg.isMain = true;
        writeProjenodyPackage(pkg);
    } catch (e) {
        logger.error('Failed to create projenody.json file.');
    }
}

function linkProjenodyPackage(pkg) {
    if (!pkg) {
        logger.info('Cannot link from null package.');
        return;
    }
    logger.info("Checking existing symlinks and updating as needed...");

    logger.debug("Attempting to create the symlinks.");

    utils.checkDirectory(ProjenodyPackage.unityProjectAssetsPath);
    // utils.checkDirectory(ProjenodyPackage.unityProjectSettingsPath);

    // Create the directories
    utils.createLink(pkg.packageAssetPath, pkg.unityAssetsPath);
    utils.createLink(pkg.packageProjectSettingsPath, ProjenodyPackage.unityProjectSettingsPath);

    linkDirectories(ProjenodyPackage.packageModules);

    logger.debug('Done creating symlinks.');
}

var pkg = getProjenodyPackage(process.cwd());
initProjenodyPackage(pkg);
linkProjenodyPackage(pkg);

function linkDirectories(directory) {
    logger.debug("Linking directory " + directory);
    directory = path.normalize(directory + '/node_modules/');

    if (fs.existsSync(directory)) {
        var directories = fs.readdirSync(directory);
        if (directories) {
            linkDirectories(directories);

            for (var dir of directories) {
                dir = path.normalize(ProjenodyPackage.packageModules + '/' + dir);
                logger.debug("Looking at directory: " + dir);

                var ppkg = getProjenodyPackage(dir);
                if (!ppkg) {
                    logger.debug("Found non-projenody package.  Leaving it.");
                    continue;
                }

                logger.debug("Examining " + ppkg.name + " with asset path " + ppkg.packageAssetPath);
                utils.createLink(ppkg.packageAssetPath, ppkg.unityAssetsPath);

                linkDirectories(dir);
            }
        }
    }
}

program.parse(process.argv);

// if program was called with no arguments, show help.
if (program.args.length === 0) program.help();