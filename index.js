#!/usr/bin/env node

require('pkginfo')(module, 'version');
var extend = require('util')._extend;
var fs = require('fs');
var jsonfile = require('jsonfile');
var utils = require('./projenody-utils');
var ProjenodyPackage = require('./projenody-package');
var program = require("commander");
var npm = require('npm-programmatic');
var path = require('path');
var logger = require('./projenody-log');

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
        return new ProjenodyPackage(extend(p, {name: npmPackage.name}));
    } catch (e) {
        return null;
    }
}

function getMainProjenodyPackage() {
    var pkg = getProjenodyPackage(process.cwd());
    pkg.isMain = true;
    return pkg;
}

program
    .version(module.exports.version)
    .description("A nodejs based Unity3d package manager.")
    .option('-v, --verbose', 'Enable additional logging.')
    .usage('[command] [options]');

program.command('init')
// .option('-a, --assets-folder <folder>', 'Folder within package root where we can find the assets for the project.  Defaults to "Assets"')
// .option('-p, --target-folder <folder>', 'Folder within package root where we can find the project settings.  Defaults to "ProjectSettings"')
// .option('-p, --project-settings-folder <folder>', 'Folder within project root where we can find the project settings for the project.  Defaults to "ProjectSettings"')
    .description('Generates the Projenody config files.')
    .action(function (options) {
        options = options || {};

        var pkg = getProjenodyPackage(process.cwd())
        if (pkg) {
            logger.info('Already initialized.  Run "projenody -h" for more information.');
            process.exit(1);
        }

        jsonfile.readFile(path.normalize(process.cwd() + '/package.json'), function (err, obj) {
            if (err) {
                logger.info("No package.json file exists.");

                utils.runSimple('npm init', function (isError, e) {
                    if (isError) {
                        logger.error('Failed to initialize.  Error: ' + e);
                        process.exit(1);
                    }
                    var npkg = require(path.normalize(process.cwd() + '/package.json'));
                    var pkg = new ProjenodyPackage({name: npkg.name});
                    pkg.isMain = true;
                    writeProjenodyPackage(pkg);
                });
            } else {
                var pkg = new ProjenodyPackage({name: obj.name});
                pkg.isMain = true;
                writeProjenodyPackage(pkg);
            }
        });
    });

program.command('list')
    .description('List the dependencies.')
    .action(function () {
        var pkg = getMainProjenodyPackage();
        if (!pkg) {
            logger.error('Cannot list from uninitialized projenody project.  Run "projenody init" to create a new project in this directory.');
            process.exit(1);
        }

        utils.runSimple('npm list');
    });

program.command('add <packageToAdd>')
    .description("Adds a dependency to the projenody package.")
    .action(function (packageToAdd, options) {
        var pkg = getMainProjenodyPackage();
        if (!pkg) {
            logger.error('Cannot add from uninitialized projenody project.  Run "projenody init" to create a new project in this directory.');
            process.exit(1);
        }

        utils.runSimple('npm install ' + packageToAdd + ' --save');
    });

program.command('resolve')
    .description('Downloads the dependency folders.')
    .action(function (options) {
        var pkg = getMainProjenodyPackage();
        if (!pkg) {
            logger.error('Cannot resolve from uninitialized projenody project.  Run "projenody init" to create a new project in this directory.');
            process.exit(1);
        }

        utils.runSimple('npm install');
    });

program.command('link')
    .description("Creates (or recreates) the symlinks for dependencies")
    .option('-f, --force', 'Same as running -cm and default behavior')
    .option('-c, --clear', 'Removes existing symlinks')
    .option('-m, --make', 'Creates symlinks for all dependencies and local assets.')
    .action(function (options) {
        logger.info("Checking existing symlinks and updating as needed...");

        var pkg = getMainProjenodyPackage();
        if (!pkg) {
            logger.error('Cannot link from uninitialized projenody project.  Run "projenody init" to create a new project in this directory.');
            process.exit(1);
        }

        if (options.make) {
            logger.debug("Attempting to create the symlinks.");

            utils.checkDirectory(ProjenodyPackage.unityProjectAssetsPath);
            // utils.checkDirectory(ProjenodyPackage.unityProjectSettingsPath);

            // Create the directories
            utils.createLink(pkg.packageAssetPath, pkg.unityAssetsPath);
            utils.createLink(pkg.packageProjectSettingsPath, ProjenodyPackage.unityProjectSettingsPath);

            linkDirectories(ProjenodyPackage.packageModules);

            logger.debug('Done creating symlinks.');
        }
    });

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