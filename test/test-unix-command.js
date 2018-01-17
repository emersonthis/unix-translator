const unixCommand = require('../lib/unix-command/unix-command.js');
const expect = require('chai').expect;

describe('translate', function() {

    it('should describe a single command without options', function(done){
        unixCommand.translate('cat').then( summary => {
            expect(summary).to.equal('concatenate and print files');
        });
        done();
    });

    // it('should describe a single command with options', function(done){
    //     unixCommand.translate('cat -n', summary => {
    //         expect(summary).to.equal('concatenate and print files, Number the output lines, starting at 1.');
    //         done();
    //     });
    // });



});
