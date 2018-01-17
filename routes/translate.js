var express = require('express');
var router = express.Router();

var unixCommand = require('../lib/unix-command/unix-command.js');

router.post('/', function(req, res, next) {

    let search = req.body.search;
    let translation;

    if (search) {
        // firstCommand = search.match(/[a-zA-Z]*\b/g); //todo
        console.log('search', search);
        unixCommand.translate(search).then( trans => {
            console.log('trans', trans);
            res.render('index', { title: 'Translation', search: search, translation: trans});
        }); ;
    }
});

module.exports = router;
