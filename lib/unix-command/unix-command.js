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
        '>>' : "append output to a file:",
        '>' : "redirect output to a file",
        '<' : "read the preceeding command's input from a file",
        // 'tee' : 'redirect output to a file: '
    },
    splitRegex: /(>>|[\|><])/g,
    in: function(char) {
        return !!Object.keys(this.list).find( element => element===char );
    },
    say: function(char) {
        return this.list[char];
    },
    split: function (commandsString) {
        return commandsString.split(this.splitRegex);
    }
}

function nameDescription (manText) {
    const results = manText.match(/--?\s*(.+)/);
    return results[1].trim();
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

        const commands = conjunctions.split(commandString);
        let promiseArray = [];
        let index = 0;
        let memory = {
            lastType : null, //conjunction | command | argument | options, We initialize with conj to handle the first
            last : null
        };

        for (let i=0; i<commands.length; i++) {

            // handle conjunctions first
            if (conjunctions.in(commands[i])) {
                promiseArray[index] = conjunctions.say(commands[i]);
                index++;
                memory.lastType = 'conjunction';
                memory.last = commands[i];
                continue;
            }

            let commandParts = commands[i].trim().split(/\s+/g);

            for (let j=0; j<commandParts.length; j++) {

                let part = commandParts[j];

                if ( memory.last === '|' || memory.last===null ) { //@TODO This feels too naive
                    promiseArray[index] = 
                        manPage(part)
                        .then(function(manText){ 
                            return nameDescription(manText);
                        })
                        .catch( (err) => { console.error('manTextError: ',err); });
                    memory.lastType = 'command';

                } else if (isOptions(part)) {
                    promiseArray[index] = '[with options '+part+']';                    
                    memory.lastType = 'option';

                } else if (isArgument(part)) {//@TODO this is TRUE
                    promiseArray[index] = part;
                    memory.lastType = 'argument';

                } else { // We never get here yet
                    promiseArray[index] = '???'
                }

                memory.last = part; //trim()?
                index++;

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
