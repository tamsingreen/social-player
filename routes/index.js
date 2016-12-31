const express = require('express'),
			async = require('async'),
			router = express.Router(),
			dao = require('../lib/dao');

router.get('/', (req, res) => {
	res.render('index', { title: 'Social Player'});
});

router.get('/episodes/:pid', (req, res) => {
	const pid = req.params.pid;
	dao.getiPlayerEpisodes(pid)
		.then((episodeData) => {
			res.render('episodes', {data: episodeData, layout: false});
		})
		.catch(() => {
			res.sendStatus(500);
		});
});

router.post('/programmes/', (req, res) => {
	const db = req.db;
	const fbIds = req.body;
	dao.matchProgrammes(fbIds, db)
		.then((result) => {
			res.json(result);
		})
		.catch((error) => {
			res.sendStatus(500);
		});
});

router.get('/admin', (req, res) => {
	const db = req.db;
	dao.getAllProgrammes(db, (result) => {
		res.render('admin', { title: 'Social Player - Admin', data: result});
	});
});

module.exports = router;
