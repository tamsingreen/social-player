var express = require('express'),
		router = express.Router(),
		dao = require('../lib/dao');

router.get('/', function(req, res) {
	res.render('index', { title: 'Social Player'});
});

router.post('/programmes/', function(req, res) {
	var db = req.db;
	var fbIds = req.body;
	dao.matchProgrammes(fbIds, db, function(result) {
		if (result.error) {
			res.sendStatus(result.error);
		} else {
			res.json(result.data);
		}
	});
});

router.get('/admin', function(req, res) {
	var db = req.db;
	dao.getAllProgrammes(db, function(result) {
		// console.log(result);
		res.render('admin', { title: 'Social Player - Admin', data: result});
	});
});
module.exports = router;
