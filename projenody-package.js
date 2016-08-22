'use strict';

class ProjenodyPackage {
    constructor(config) {
        console.log("Creating package object from " + JSON.stringify(config));

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
        return this.isMain ? process.cwd() : this.packageModules + '/' + this.name;
    }

    get packageModules() {
        return process.cwd() + '/node_modules';
    }

    get packageAssetPath() {
        return this.packageBasePath + '/' + this.assetsFolder;
    }

    get packageProjectSettingsPath() {
        return this.packageBasePath + '/' + this.assetsFolder;
    }

    get packageProjenodyFile() {
        return this.packageBasePath() + '/projenody.json';
    }

    get unityProjectPath() {
        return process.cwd() + '/' + this.name + '.unity'
    }

    unityAssetPath(unityProjectPath) {
        unityProjectPath = unityProjectPath || this.unityProjectPath;
        return unityProjectPath + '/Assets/' + this.targetFolder;
    }

    unityProjectSettingsPath(unityProjectPath) {
        unityProjectPath = unityProjectPath || this.unityProjectPath;
        return this.projectSettingsFolder ? unityProjectPath + '/' + this.projectSettingsFolder : null;
    }
}

module.exports = ProjenodyPackage;