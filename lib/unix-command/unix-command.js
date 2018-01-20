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

const conjunctions = {
    list: {
        '|' : "pass the output to",
        '>' : "redirect output to a file",
        '>>' : "append output to a file",
        '<' : "read the preceeding command's input from a file",
        'tee' : 'redirect output to a file: '
    },
    in: function(char) {
        // console.log('this.list', this.list);
        // console.log('this.list.keys', this.list.keys);

        return Object.keys(this.list).find( element => element===char );
    },
    say: function(char) {
        return this.list[char];
    }
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
    return commandString.split(/([\|;])/); //todo
}

module.exports = {

    translate: function (commandString, callback) {

        const commands = splitCommands(commandString);
        let translationArray = [];

        let promiseArray = [];

        for (let i=0; i<commands.length; i++) {

            if (conjunctions.in(commands[i])) {
                translationArray[i] = conjunctions.say(commands[i]);
                continue;
            }

            let name = isolateCommandName(commands[i]);
            promiseArray.push(  manPage(name)
                .then(function(manText){ 
                    translationArray[i] = nameDescription(manText);
                })
                .catch( (err) => { console.error(err.message); } )

                );
        }

        return Promise.all(promiseArray).then( function(results){
            return translationArray.join(' '); 
        })
        .catch(function(err) {
            // Will catch failure of first failed promise
            console.log("Failed:", err);
        });        
    }



};

