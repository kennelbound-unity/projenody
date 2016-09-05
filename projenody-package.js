'use strict';

var path = require('path');
var logger = require('./log');

class ProjenodyPackage {
    constructor(config) {
        logger.debug("Creating package object from " + config.name + " package.json");
        this.name = config.name;
        // Folder under package root that contains the assets
        this.assetsFolder = config.assetsFolder || 'Assets';
        // Folder under /Assets to put the files.
        this.targetFolder = config.targetFolder || ('/' + this.name);
        // Folder under package root that contains the project settings.  Optional
        this.projectSettingsFolder = config.projectSettingsFolder || null;
        // Target project folder
        this.projectTargetFolder = config.projectTargetFolder || (this.name + '.unity');
        // Whether this is the main project
        this.applicationPackage = config.applicationPackage;
        this.pluginPackage = config.pluginPackage;
        this.pluginOverrides = config.pluginOverrides || [];
        this.isMain = config.isMain;
    }

    get packageBasePath() {
        return path.normalize(this.isMain ? process.cwd() : (process.cwd() + '/node_modules/' + this.name));
    }

    get projectTarget() {
        return this.projectTargetFolder;
    }

    get packageModules() {
        return path.normalize(this.packageBasePath + '/node_modules');
    }

    get packageAssetPath() {
        return path.normalize(this.packageBasePath + '/' + this.assetsFolder);
    }

    get packageProjectSettingsPath() {
        return path.normalize(this.packageBasePath + '/' + this.projectSettingsFolder);
    }

    get packageProjenodyFile() {
        return path.normalize(this.packageBasePath + '/projenody.json');
    }

    get unityProjectPath() {
        return path.normalize(this.packageBasePath + '/' + this.projectTarget);
    }

    get unityProjectAssetsPath() {
        return path.normalize(this.unityProjectPath + '/Assets');
    }

    get unityProjectSettingsPath() {
        return path.normalize(this.unityProjectPath + '/ProjectSettings');
    }

    get unityAssetsPath() {
        return path.normalize(this.unityProjectAssetsPath + '/' + (this.pluginPackage ? 'Plugins/' : '').toString() + this.targetFolder);
    }
}

module.exports = ProjenodyPackage;