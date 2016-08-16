#!/usr/bin/env node
require('pkginfo')(module, 'version');

var program = require("commander");

function collect(val, memo) {
    memo.push(val);
    return memo;
}

program
    .version(module.exports.version)
    .usage('[options]');

program.command('init')
    .option('-i, --init', 'Create a project in this location')
    .option('-a, --add <package>', 'Add package to this project', collect, [])
    .option('-c, --create-project', 'Create the unity project with symlinks.')
    .option('-n, --name <name>', 'Set the name of the project, otherwise defaults to "unity".')
    .parse(process.argv);

var showUsage = true;
if (program.init) {
    showUsage = false;
    console.log("Creating new package...");
}

if (program.add && program.add.length > 0) {
    console.log("Adding dependency package(s)...");
    program.add.forEach(function (item, idx) {
        console.log("   Adding dependency " + item);
    });
    showUsage = false;
}

if (program.createProject) {

}

if (showUsage) {
    program.help();
}