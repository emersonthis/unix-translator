'use strict';

var exec = require('child_process').exec;

module.exports = {

    translate: function (commandName, callback) {
        exec(`man ${commandName} | col -b`, function(stdin,stdout,sterr){
            // console.log(stdout);
            let results = stdout.match(/--?\s*(.+)/);
            callback(results[1]);
        });
    }

};

