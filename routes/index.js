var express = require('express');
var router = express.Router();

// var command = require('../lib/unix-command/command.js');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'UNIX Command Translator' });
});

module.exports = router;
