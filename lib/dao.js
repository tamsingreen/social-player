var async = require('async'),
    request = require('request-promise'),
    Promise = require('bluebird');

function matchProgrammes(fbIds, db, callback) {
  var matchingProgrammes = [];
  var result = {};
  var promise = Promise();
	switch (validateJson(fbIds)) {
		case 'is not array':
		case 'not valid':
			result.error = 400;
      promise.resolve(result);
			break;
		case 'is empty array':
      result.data = {bbcBrandPids: matchingProgrammes};
      promise.resolve(result);
			break;
		case 'valid':
			async.each(fbIds.fbIds, function(fbId, eachCallback) {
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
            promise.resolve(result);
					}	else {
            result.data = {bbcBrandPids: matchingProgrammes};
            promise.resolve(result);
					}
			});
			break;
	}
  return promise;
}

function getAllProgrammes(db, callback) {
  db.collection('programmelist').find({}).toArray(function(err, result) {
    if (err) callback(err);
    callback(result);
  });
}

function getiPlayerEpisodes(pid) {
  return request.get('http://www.bbc.co.uk/programmes/' + pid + '/episodes/player.json')
    .then(function(response) {
      return Promise.resolve(response);
    }, function(error) {
      return Promise.reject(error);
    });
}

function _validateJson(fbIds) {
	var result = '';
	if (!Array.isArray(fbIds.fbIds)) {
		result = 'is not array'
	} else {
		if (fbIds.fbIds.length === 0) {
			result = 'is empty array'
		} else {
			if (typeof fbIds.fbIds[0] === 'string') {
				result = 'valid' //substitute for validation against schema later?
			} else {
				result = 'not valid'
			}
		}
	}
	return result;
}

module.exports = {
  matchProgrammes: matchProgrammes,
  getAllProgrammes: getAllProgrammes,
  getiPlayerEpisodes: getiPlayerEpisodes
}
