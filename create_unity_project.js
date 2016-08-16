module.exports = function(program, name) {
    if (!name) {
        console.log("Must provide the name field.");
        program.help();
        return;
    }
    console.log('Creating project %s', name);

    var fs = require('fs');
    var dir = program.name;
    if (!fs.existsSync(dir)) {
        console.log("Creating project folder.");
        fs.mkdirSync(dir);
    }

    var npm = require('npm');

    npm.load(function(err, npm) {
        npm.commands.ls([], true, function(err, data, lite) {
            console.log(data); //or lite for simplified output
        });
    });
};