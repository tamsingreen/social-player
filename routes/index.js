var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'Social Player'});
});

//takes a Facebook programme id and returns a BBC brand pid if a match is found
router.get('/programmes/:id', function(req, res) { 
	var db = req.db;
	var fbId = req.params.id;
	var matchingProgrammes = [];
	db.collection('programmelist').findOne({fbId: fbId}, function(err, result) {
		res.json(result);
	});
});

module.exports = router;
