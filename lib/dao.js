var async = require('async');

exports.matchProgrammes = function(fbIds, db, callback) {
  var matchingProgrammes = [];
  var result = {};
	switch (validateJson(fbIds)) {
		case 'is not array':
		case 'not valid':
			result.error = 400; //res.sendStatus(400);
      callback(result);
			break;
		case 'is empty array':
      result.data = {bbcBrandPids: matchingProgrammes};
      callback(result);
			break;
		case 'valid':
			async.each(fbIds.fbIds, function(fbId, eachCallback) {
        console.log('Searching db for ' + fbId);
				db.collection('programmelist').findOne({fbId : fbId}, function(err, result) {
						if (err) eachCallback(err);
						if (result != null) {
							matchingProgrammes.push(result.bbcBrandPid);
						} eachCallback();
					});
				}, function(err) {
					if (err) {
						console.log('Error querying POST /programmes Mongo, error: ' + err);
            result.error = 500;
            callback(result);
					}	else {
            result.data = {bbcBrandPids: matchingProgrammes};
            callback(result);
					}
			});
			break;
	}
}

exports.getAllProgrammes = function(db, callback) {
  db.collection('programmelist').find({}).toArray(function(err, result) {
      if (err) callback(err);
      callback(result);
    });
}

function validateJson(fbIds) {
	var result = '';
	if (!Array.isArray(fbIds.fbIds)) {
		result = 'is not array'
	} else {
		if (fbIds.fbIds.length == 0) {
			result = 'is empty array'
		} else {
			if (typeof fbIds.fbIds[0] == 'string') {
				result = 'valid' //substitute for validation against schema later?
			} else {
				result = 'not valid'
			}
		}
	}
	return result;
}
