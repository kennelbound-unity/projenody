'use strict';

var fs = require('fs');
var util = require('./projenody-utils');

class ProjenodyProject {
    constructor(folder) {
        this.init(folder)
    }

    init(folder) {
        this.folder = folder;
        this.projenodyConfig = require(folder + "/projenody.json");
        this.isProject = this.projenodyConfig.project ? true : false;
        this.config = this.isProject ? this.projenodyConfig.project : this.projenodyConfig.package;

        this.name = this.config.name;
    }

    get isRoot() {
        return this._isRoot;
    }

    set isRoot(isRoot) {
        this._isRoot = isRoot;
    }

    createUnityProject() {
        if(!isRoot) {
            console.error("Cannot create unity project for non-root package.");
        }
        util.checkDirectory()
    }
}


var jsonfile = require('jsonfile');
var project = module.exports = {};

project.readConfig = function () {
    var file = './projenody.json';

    try {
        return jsonfile.readFileSync(file).project;
    } catch (e) {
        // projeny file doesn't exist.  Quit out with instructions on how to create it.
        console.error("Could not find valid projenody.json.  Please use prjn init to create.");
        process.exit(1);
    }
};

project.updateConfig = function (config) {
    jsonfile.writeFileSync('./projenody.json', {project: config});
};

project.createUnityProjectFolder = function (config) {
    if (config.verbose) console.info("Creating project folder %s", config.name);

    var fs = require('fs');
    var dir = config.name;

    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
    }
};

project.createLocalAssetsSymlink = function (config) {
    var folder = process.cwd();

    var alreadyLoaded = {};
    // this.getDependencies(require(folder + '/package.json'), alreadyLoaded, {});
    require('fs').readdir(folder + "/node_modules", function (error, files) {
        if (error) {
            console.log("Error finding the node_modules directory.  Error message: %s", JSON.stringify(error));
            process.exit(1);
        }

        for (var folder of files.filter(function (x) {
            return x != ".bin"
        })) {

        }

        console.log("Found files: " + JSON.stringify(files));
    });

    console.log("Found alreadyLoaded of " + JSON.stringify(alreadyLoaded));

    // Get dependency graph
    // For each dependency
    // Check for projenody file.  If not there then log and continue.
    // If there, then create symlink using the info

    // TODO: Handle dependency changes
};

project.getDependencies = function (pkgInfo, alreadyLoaded, ignored) {
    console.log("gd: " + JSON.stringify(pkgInfo));

    if (pkgInfo.config && pkgInfo.config.projenody) {
        if (alreadyLoaded[pkgInfo.name] || ignored[pkgInfo.name]) {
            return;
        }
        alreadyLoaded[pkgInfo.name] = pkgInfo
    } else {
        ignored[pkgInfo] = pkgInfo;
        return;
    }

    var self = this;
    if (pkgInfo.dependencies) {
        var cp = require('child_process');

        for (var key in pkgInfo.dependencies) {
            console.log("Found dependency: %s", key);
            var depPath = require.resolve(key);
            self.getDependencies(alreadyLoaded, require(depPath + 'package.json'));
        }
    } else {
        console.log("No dependencies for pkg: " + pkgInfo.name);
    }
};