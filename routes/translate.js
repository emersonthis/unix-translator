var express = require('express');
var router = express.Router();

var command = require('../lib/unix-command/command.js');

router.post('/', function(req, res, next) {
    
    let search = req.body.search;
    let translation;

    if (search) {
        firstCommand = search.match(/[a-zA-Z]*\b/g); //todo
        console.log('firstCommand', firstCommand);
        command.translate(firstCommand[0], trans => {
            // console.log('trans', trans);
            res.render('index', { title: 'Translation', search: search, translation: trans});
        }); ;
    }
});

module.exports = router;
