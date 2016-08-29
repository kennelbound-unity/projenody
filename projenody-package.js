'use strict';

var path = require('path');
var logger = require('./projenody-log');

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
        // Whether this is the main project
        this.isMain = config.isMain;
    }

    get packageBasePath() {
        return path.normalize(this.isMain ? process.cwd() : ProjenodyPackage.packageModules + '/' + this.name);
    }

    static get packageModules() {
        return path.normalize(process.cwd() + '/node_modules');
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

    get unityAssetsPath() {
        return path.normalize(ProjenodyPackage.unityProjectAssetsPath + '/' + this.targetFolder);
    }

    static get unityProjectAssetsPath() {
        return path.normalize(process.cwd() + '/target.project/Assets');
    }

    static get unityProjectSettingsPath() {
        return path.normalize(process.cwd() + '/target.project/ProjectSettings');
    }
}

module.exports = ProjenodyPackage;