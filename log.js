'use strict';

var winston = require('winston');
winston.cli();

winston.level = 'debug';

module.exports = winston;