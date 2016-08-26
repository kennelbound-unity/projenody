#!/usr/bin/env node

require('pkginfo')(module, 'version');
var extend = require('util')._extend;
var fs = require('fs');
var jsonfile = require('jsonfile');
var utils = require('./projenody-utils');
var ProjenodyPackage = require('./projenody-package');
var program = require("commander");
var npm = require('npm-programmatic');

program
    .version(module.exports.version)
    .description("A nodejs based Unity3d package manager.")
    .option('-v, --verbose', 'Enable additional logging.')
    .usage('[command] [options]');

function writeProjenodyPackage(options) {
    var pkg = new ProjenodyPackage(options);
    jsonfile.writeFile(process.cwd() + '/projenody.json', pkg, function (error) {
        if (error) {
            console.error("Could not write projenody.json file.  Error: " + JSON.stringify(error));
            process.exit(1);
        }
        console.log("Generated the projenody file at %s", process.cwd());
    });
}

program.command('init')
    .option('-a, --assets-folder <folder>', 'Folder within package root where we can find the assets for the project.  Defaults to "Assets"')
    .option('-p, --target-folder <folder>', 'Folder within package root where we can find the project settings.  Defaults to "ProjectSettings"')
    .option('-p, --project-settings-folder <folder>', 'Folder within project root where we can find the project settings for the project.  Defaults to "ProjectSettings"')
    .description('Generates the Projenody config files.')
    .action(function (options) {
        options = options || {}
        jsonfile.readFile(process.cwd() + '/package.json', function (err, obj) {
            if (err) {
                console.log("No package.json file exists.");

                npm.load({}, function (err, npm) {
                    npm.commands.init([], function (err, res) {
                        var pkg = require(process.cwd() + '/package.json');
                        console.log("Pulled pkg " + JSON.stringify(pkg));
                        writeProjenodyPackage(extend(options, {name: pkg.name}));
                    });
                });
            } else {
                writeProjenodyPackage(obj);
            }
        });
    });

program.command('add <pkg>')
    .description("Adds a dependency to the projenody package.")
    .action(function (pkg, options) {
        npm.install([pkg], {save: true, cwd: process.cwd(), output: true})
            .then(function () {
                console.log('Successfully added %s and its dependencies.', pkg)
            })
            .catch(function () {
                console.log('Unable to install the dependecy.  Please check the path you are using.');
            });
    });

program.command('resolve')
    .description('Downloads the dependency folders.')
    .action(function (options) {
        var npm = require('npm');
        npm.load({}, function (err, npm) {
            npm.commands.install([], function (err, res) {
                if (err) {
                    console.error("Error resolving dependencies.  Specific error: %s", JSON.stringify(err));
                } else {
                    console.log("Finished resolving.")
                }
            });
        });
    });

program.command('link')
    .description("Creates (or recreates) the symlinks for dependencies")
    .option('-f, --force', 'Same as running -cm and default behavior')
    .option('-c, --clear', 'Removes existing symlinks')
    .option('-m, --make', 'Creates symlinks for all dependencies and local assets.')
    .action(function (options) {
        var p = require(process.cwd() + '/projenody.json');
        var npmPackage = require(process.cwd() + '/package.json');
        var pkg = new ProjenodyPackage(extend(p, {name: npmPackage.name}));
        pkg.isMain = true;

        // Create the directories
        utils.checkDirectory(pkg.unityProjectPath);
        utils.checkDirectory(pkg.unityProjectPath + '/Assets');

        if (fs.existsSync(pkg.packageAssetPath)) {
            utils.createLink(pkg.packageAssetPath, pkg.unityAssetPath);
        }

        if (pkg.packageProjectSettingsPath && fs.existsSync(pkg.packageProjectSettingsPath)) {
            utils.createLink(pkg.packageProjectSettingsPath, pkg.unityProjectSettingsPath);
        }

        if (options.make) {
            console.log("Attempting to create the symlinks.");
            fs.readdir(pkg.packageModules, function (error, directories) {
                for (var dir of directories) {
                    dir = pkg.packageModules + '/' + dir;

                    console.log("Examining %s", dir);
                    var prpkg = jsonfile.readFileSync(dir + '/projenody.json', {passParsingErrors: false});
                    var npmpkg = jsonfile.readFileSync(dir + '/package.json', {passParsingErrors: false});

                    if (prpkg) {
                        var ppkg = new ProjenodyPackage(extend(prpkg, {name: npmpkg.name}));
                        utils.createLink(ppkg.packageAssetPath, ppkg.unityAssetPath(pkg.unityProjectPath));
                    }
                }
            });
        }
    });

program.parse(process.argv);

// if program was called with no arguments, show help.
if (program.args.length === 0) program.help();