'use strict';

var exec = require('child_process').exec;

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
        // 'tee' : 'redirect output to a file: '
    },
    in: function(char) {
        return !!Object.keys(this.list).find( element => element===char );
    },
    say: function(char) {
        return this.list[char];
    }
}

function escapeRegExp(str) {
  return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
}

function nameDescription (manText) {
    const results = manText.match(/--?\s*(.+)/);
    return results[1].trim();
}

function splitCommands(commandsString) {
    const conjunctionChars = Object.keys(conjunctions.list).join('');
    const pattern = new RegExp('([' + escapeRegExp(conjunctionChars) + '])', 'g');
    return commandsString.split(pattern); //todo?
}

function isOptions(part) {
    return (part[0] === '-'); //@TODO we can do better than this
}

function isArgument(part) {
    //@TODO!!!!
    return true;
}

module.exports = {

    translate: function (commandString, callback) {

        const commands = splitCommands(commandString);
        let promiseArray = [];
        let index = 0;
        let memory = {
            lastType : null, //conjunction | command | argument | options, We initialize with conj to handle the first
            last : null
        };

        for (let i=0; i<commands.length; i++) {

            if (conjunctions.in(commands[i])) {
                promiseArray[index] = conjunctions.say(commands[i]);
                index++;
                memory.lastType = 'conjunction';
                continue;
            }

            let commandParts = commands[i].trim().split(/\s+/g);

            for (let j=0; j<commandParts.length; j++) {

                let part = commandParts[j];

                if ( memory.lastType === '|' || j===0 ) {
                    promiseArray[index] = 
                        manPage(part)
                        .then(function(manText){ 
                            return nameDescription(manText);
                        })
                        .catch( (err) => { console.error(err.message); });
                    memory.lastType = 'command';

                } else if (isOptions(part)) {
                    promiseArray[index] = part;                    
                    memory.lastType = 'option';

                } else if (isArgument(part)) {//@TODO this is TRUE
                    promiseArray[index] = part;
                    memory.lastType = 'argument';

                } else { // We never get here yet
                    promiseArray[index] = '???'
                }

                memory.last = part; //trim()?
                index++;

                // console.log(memory.last + ': ' +memory.lastType);

            };
        }

        return Promise.all(promiseArray).then( function(arrayOfValuesFromPromises){
            return arrayOfValuesFromPromises.join(' ');
        })
        .catch(function(err) {
            // Will catch failure of first failed promise
            console.log("Failed:", err);
        });        
    }



};

