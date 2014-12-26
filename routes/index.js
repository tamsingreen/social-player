var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'Social Player' });
});

//takes a JSON array of programme objects and returns a subset which have matching BBC brand pids
router.post('/programmes', function(req, res) { 
	var db = req.db;
	var programmes = JSON.parse(req.body.programmes);
	console.log('Programmes: ' + JSON.stringify(programmes));
	
	var matchingProgrammes = [];
	for (element in programmes) {
		console.log('For loop: ' + programmes[element].id);
		db.collection('programmelist').findOne({fbId: programmes[element].id}, function(err, result) {
			console.log('Result: ' + JSON.stringify(result));
			if (result) {
				//console.log("Truthy result: " + JSON.stringify(result));
				matchingProgrammes.push(result);
			} 
		});
	}
	//console.log('Final result: ' + JSON.stringify(matchingProgrammes));
	res.json(matchingProgrammes);
});

// //***delete, for ref only
// db.collection('bands').findOne({name:'Road Crew'}, function(err, result) {
//     console.log('Band members of Road Crew');
//     console.log(result.members);
// });

// //***delete - for ref only
// app.get('/users/:email', function (req, res) {
//     if (req.params.email) {
//         User.find({ email: req.params.email }, function (err, docs) {
//             res.json(docs);
//         });
//     }
// });

// //***delete this - for reference only
// router.delete('/deleteuser/:id', function(req,res) {
// 	var db = req.db;
// 	var userToDelete = req.params.id;
// 	db.collection('userlist').removeById(userToDelete, function(err, result) {
// 		res.send((result === 1) ? {msg: ''} : {msg: 'error: ' + err});
// 	});
// });

module.exports = router;
