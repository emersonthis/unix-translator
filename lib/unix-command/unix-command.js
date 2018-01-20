'use strict';

var exec = require('child_process').exec;


// function resolve() {

// }

// function reject() {

// }

function manPage(commandName) {

    let promise = new Promise(function(resolve, reject) {

        exec(`man ${commandName} | col -b`, function(stdin,stdout,sterr){
            if (sterr) {
                reject(sterr);
            } else {
                resolve(stdout);
            }
        });

    });

    return promise;
}

function isolateCommandName(string) {
    let matches = string.match(/[a-zA-Z]*\b/g);
    return matches[0];
}

function nameDescription (manText) {
    const results = manText.match(/--?\s*(.+)/);
    return results[1];
}

function splitCommands(commandString) {
    return commandString.split(/\|;/); //todo
}

module.exports = {

    translate: function (commandString, callback) {

        const commands = splitCommands(commandString);

        console.log('commands', commands);

        let str = '';

        let promiseArray = [];

        for (let i=0; i<commands.length; i++) {
            let name = isolateCommandName(commands[i]);
            promiseArray.push(  manPage(name)
                .then(function(manText){ 
                    str += nameDescription(manText);
                })
                .catch( (err) => { console.error(err.message); } )

                );
        }

        return Promise.all(promiseArray).then( function(results){ 
            return str; 
        })
        .catch(function(err) {
            // Will catch failure of first failed promise
            console.log("Failed:", err);
        });        
    }



};

