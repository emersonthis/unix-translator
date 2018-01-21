const unixCommand = require('../lib/unix-command/unix-command.js');
const expect = require('chai').expect;

describe('translate', function() {

    it('should describe a single command without options', function(done){
        unixCommand.translate('cat').then( response => {
            expect(response).to.equal('concatenate and print files');
        })
        .then(() => done(), done);
    });

    it('should describe a single command with options', function(done){
        unixCommand.translate('cat -n').then( summary => {
            expect(summary).to.equal('concatenate and print files [with options -n]');
        })
        .then(done, done);
    });

    it('should split piped commands', function(done){
        unixCommand.translate('echo "HI" | cat').then( response => {

            expect(response).to.equal('write arguments to the standard output "HI" pass the output to concatenate and print files');
        })
        .then(done, done);
        
    });

    it('should split redirect commands', function(done){
        unixCommand.translate('echo "HI" > file.txt').then( response => {

            expect(response).to.equal('write arguments to the standard output "HI" redirect output to a file file.txt');
        })
        .then(done, done);
        
    });

    it('should split appended commands', function(done){
        unixCommand.translate('echo "HI" >> file.txt').then( response => {

            expect(response).to.equal('write arguments to the standard output "HI" append output to a file: file.txt');
        })
        .then(done, done);
        
    });




});
