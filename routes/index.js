var express = require('express');
var router = express.Router();
var async = require('async');

/* GET home page. */
router.get('/', function(req, res) {
	res.render('index', { title: 'Social Player'});
});

router.post('/programmes/', function(req, res) {
	var db = req.db;
	var fbIds = req.body;
	var matchingProgrammes = [];
	switch (validateJson(fbIds)) {
		case 'is not array':
		case 'is not valid JSON':
			res.sendStatus(400);
			break;
		case 'is empty array':
			res.json(matchingProgrammes);
			break;
		case 'valid JSON':
			async.each(fbIds, function(fbId, callback) {
				db.collection('programmelist').findOne(fbId, function(err, result) {
						if (err) {
							callback(err);
						} else if (result != null) {
							matchingProgrammes.push({'bbcBrandPid' : result.bbcBrandPid});
						} callback();
					});
				}, function(err) {
					if (err) {
						console.log('Handle err: ' + err);
						res.sendStatus(500);
					}	else {
						res.json(matchingProgrammes);
					}
			});
			break;
	}
});

var validateJson = function(fbIds) {
	var result = '';
	if (!Array.isArray(fbIds)) {
		result = 'is not array'
	} else {
			if (fbIds.length == 0) {
				result = 'is empty array'
			} else {
				if (fbIds[0].hasOwnProperty('fbId')) {
					result = 'valid JSON' //substitute for validation against schema later?
				} else {
					result = 'is not valid JSON'
				}
			}
	}
	return result;
}

module.exports = router;
