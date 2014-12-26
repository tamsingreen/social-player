var fbUserID = "";
var fbLikes = [];
var categoryLikes = [];
var bbcResults = [];

function facebookLogin() {
    FB.getLoginStatus(function(response) {
	    if (response.status === 'connected') {
	        console.log('Logged in.');
	        fbUserID = response.authResponse.userID;
	    } else {
	        FB.login(function(response) {
	            //handle response
	            fbUserID = response.authResponse.userID;
	        }, {scope: 'user_likes'});
	    }
	});
}

function listLikes() {
	console.log('listLikes()');
	var uri = '/' + fbUserID + '/likes';
	FB.api(uri, collateLikes);
	
	function collateLikes(response) {	
	    for (element in response.data) {
	    	fbLikes.push(response.data[element]);        
	    }
	    if (response.paging.next) {
			$.get(response.paging.next, collateLikes, 'json');
		}
	}
}

function searchCategories(event) {
	var category = event.data.category;
	for (element in fbLikes) {
		if (fbLikes[element].category === category) {
			categoryLikes.push(fbLikes[element]);
		}
	}
}

//Sends a JSON array of all matching categories (and associated Facebook data) to the /programmes endpoint.
//All data is sent for possible future error-checking, could be re-evaluated in future
function searchBBCProgrammes() {
	console.log("Programmes object sent from global.js: " + JSON.stringify(categoryLikes));
	$.post('/programmes/', {programmes : JSON.stringify(categoryLikes)})
		.done(function(data) {
			//console.log(data);
			bbcResults = data;
	});
}