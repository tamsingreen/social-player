var fbUserID = "";
var fbLikes = [];
var categoryLikes = [];
var bbcResults = [];

//Login in to user's Facebook, requesting the 'user_likes' scope if not already granted
function facebookLogin() {
    console.log('facebookLogin()');
    FB.getLoginStatus(function(response) {
        if (response.status === 'connected') {
            console.log('Logged in.');
            fbUserID = response.authResponse.userID;
        } else {
            console.log("Logging in");
            FB.login(function(response) {
                //handle response
                fbUserID = response.authResponse.userID;
            }, {scope: 'user_likes'});
        }
    });
}

//Request a list of the user's Facebook likes and pass them to collateLikes()
function listLikes() {
    console.log('listLikes()');
    var uri = '/' + fbUserID + '/likes';
    console.log("URI: " + uri);
    FB.api(uri, collateLikes);
}

//Page through Facebook likes and collate in fbLikes array
function collateLikes(response) {   
    for (element in response.data) {
        fbLikes.push(response.data[element]);        
    }
    if (response.paging.next) {
        $.get(response.paging.next, collateLikes, 'json');
    }
}

//Search the user's fbLikes for all matching the specified category (usually 'Tv shows')
function searchCategories(event) {
    console.log('searchCategories()');
    var category = event.data.category;
    for (element in fbLikes) {
        if (fbLikes[element].category === category) {
            categoryLikes.push(fbLikes[element]);
        }
    }
}

//For each programme in categoryLikes, send the id property to the /programmes endpoint, and if the result is non-null, add the BBC brand PID to bbcResults
function searchBBCProgrammes() {
    for (element in categoryLikes) {
        $.get('/programmes/' + categoryLikes[element].id)
            .done(function(data) {
                if (data) {
                    bbcResults.push(data.bbcBrandPid);
                }
        });
    }
}