#!/usr/bin/env node

require('pkginfo')(module, 'version');
var fs = require('fs');
var jsonfile = require('jsonfile');
var path = require('path');
var logger = require('./log');

var utils = require('./utils');
var ProjenodyPackage = require('./projenody-package');

function writeProjenodyPackage(ppkg) {
    var isMain = ppkg.isMain;
    try {
        var path = path.normalize(ppkg.packageProjenodyFile);
        delete ppkg.isMain;
        jsonfile.writeFile(path, ppkg, function (error) {
            if (error) {
                logger.error("Could not write projenody.json file.  Error: " + JSON.stringify(error));
                process.exit(1);
            }
            logger.info("Generated the projenody file at " + process.cwd());
        });
    }
    finally {
        ppkg.isMain = isMain;
    }
}

function getProjenodyPackage(directory) {
    try {
        var p = require(path.normalize(directory + '/projenody.json'));
        var npmPackage = require(path.normalize(directory + '/package.json'));
        p.name = p.name || npmPackage.name;
        return new ProjenodyPackage(p);
    } catch (e) {
        return null;
    }
}

function initProjenodyPackage(ppkg) {
    if (ppkg) {
        return;
    }

    try {
        var obj = jsonfile.readFileSync(path.normalize(process.cwd() + '/package.json'));
        pkg = new ProjenodyPackage({name: obj.name});
        writeProjenodyPackage(pkg);
    } catch (e) {
        logger.error('Failed to create projenody.json file.');
    }
}

function linkProjenodyPackage(ppkg) {
    if (!ppkg) {
        logger.info('Cannot link from null package.');
        return;
    }
    logger.info("Checking existing symlinks and updating as needed...");
    logger.debug("Attempting to create the symlinks.");

    utils.checkDirectory(ppkg.unityProjectAssetsPath);
    // utils.checkDirectory(ProjenodyPackage.unityProjectSettingsPath);

    // Create the directories
    utils.createLink(ppkg.packageAssetPath, ppkg.unityAssetsPath);
    utils.createLink(ppkg.packageProjectSettingsPath, ppkg.unityProjectSettingsPath);

    linkDirectories(ppkg.packageBasePath);

    logger.debug('Done creating symlinks.');
}

var pkg = getProjenodyPackage(process.cwd());
initProjenodyPackage(pkg);
pkg.isMain = true;
linkProjenodyPackage(pkg);

function linkDirectories(directory) {
    logger.debug("Linking directory " + directory);
    directory = path.normalize(directory + '/node_modules/');

    if (fs.existsSync(directory)) {
        var directories = fs.readdirSync(directory);
        if (directories) {
            linkDirectories(directories);

            for (var dir of directories) {
                dir = path.normalize(pkg.packageModules + '/' + dir);
                logger.debug("Looking at directory: " + dir);

                var ppkg = getProjenodyPackage(dir);
                if (!ppkg) {
                    // TODO: Check for an Assets folder in the root.
                    logger.debug("Found non-projenody package.  Leaving it.");
                    continue;
                }

                logger.debug("Examining " + ppkg.name + " with asset path " + ppkg.packageAssetPath);
                var pluginOverride = pkg.pluginOverrides.indexOf(ppkg.name) > -1;
                utils.createLink(ppkg.packageAssetPath, pkg.unityProjectAssetsPath + '/' + (pluginOverride ? 'Plugins/' : '').toString() + ppkg.targetFolder);

                linkDirectories(dir);
            }
        }
    }
}