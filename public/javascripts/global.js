var fbLikes = [];
var categoryLikes = [];
var bbcResults = [];

//Login in to user's Facebook, requesting the 'user_likes' scope if not already granted
function facebookLogin() {
    FB.getLoginStatus(function(response) {
        if (response.status === 'connected') {
            $('#login').show();
            $('.loading').show();
            listLikes(response.authResponse.userID);
        } else {
            FB.login(function(response) {
                if (response.status === 'connected') {
                    $('#login').show();
                    $('.loading').show();
                    listLikes(response.authResponse.userID);
                } else {
                    $('.loading').show();
                    $('#loading-message').text('Social Player needs permission to view your Facebook likes in order to find programmes to watch. Click the Find Programmes button to try again.');
                    $('#spinner').hide();
                }
            }, {scope: 'user_likes'});
        }
    });
}

//Check we have been granted permission to access user_likes, then request them
function listLikes(fbUserID) {
    FB.api('/' + fbUserID + '/permissions', function(response) {
        console.log(response);
        var permissionGranted = false;
        for (var i = 0; i < response.data.length; i++) {
            console.log(response.data[i].permission + ', ' + response.data[i].status);
            if (response.data[i].permission === 'user_likes' && response.data[i].status === 'granted') {
                permissionGranted = true;
                $('#loading-message').text('Retrieving your likes from Facebook');
                FB.api('/' + fbUserID + '/likes', collateLikes);
            }
        }
        if (!permissionGranted) {
            $('#loading-message').text('It looks like we don\'t have your permission to access your Facebook likes. If you\'d like to try again, please login again and grant all requested permissions.');
        }
    });
}

//Page through Facebook likes and collate in fbLikes array
function collateLikes(response) {
    for (var i = 0; i < response.data.length; i++) {
        fbLikes.push(response.data[i]);
    }
    if (response.paging.next) {
        $.get(response.paging.next, collateLikes, 'json');
    } else {
        //when complete
        searchCategories('Tv show');
    }
}

//Search the user's fbLikes for all matching the specified category (usually 'Tv show')
function searchCategories(category) {
    $('#loading-message').text('Searching for your favourite TV shows');
    for (var i = 0; i < fbLikes.length; i++) {
        if (fbLikes[i].category.toUpperCase === category.toUpperCase) {
            categoryLikes.push(fbLikes[i]);
        }
    }
    if (categoryLikes.length === 0) {
        $('#spinner').hide();
        $('#loading-message').text('No TV programmes were found in your Facebook likes.');
    } else {
        searchBBCProgrammes(function() {
            $('.loading').hide();
            $('#login-button').hide();
        });
    }
}

//For each programme in categoryLikes, send the id property to the /programmes endpoint, and if the result is non-null, add the BBC brand PID to bbcResults and call displayProgrammeMetadata
function searchBBCProgrammes(callback) {
    $('#loading-message').text('Searching for your favourite TV shows from the BBC');
    var matchingProgrammesFound = 0;
    for (var i = 0 ; i < categoryLikes.length; i++) {
        $.get('/programmes/' + categoryLikes[i].id)
            .done(function(data) {
                if (data) {
                    bbcResults.push(data.bbcBrandPid);
                    displayProgrammeMetadata(data.bbcBrandPid);
                    matchingProgrammesFound++;
                }
        });
    }
    $(document).ajaxStop(function() {
        if (matchingProgrammesFound > 0) {
            callback();
        } else {
            $('#spinner').hide();
            $('#loading-message').text('No iPlayer programmes matching your likes could be found.');
            //TODO: suggest some Facebook pages to like or iPlayer programmes to watch?
        }
    });
}

function displayProgrammeMetadata(bbcBrandPid) {
    var programme = $('.programme-master').html();
    $.get('http://www.bbc.co.uk/programmes/' + bbcBrandPid + '/episodes/player.json')
        .done(function(data) {
            for (var i = 0; i < data.episodes.length; i++) {
                $('#programme-container').append(programme);
                $('.programme').last().wrap("<a href='http://www.bbc.co.uk/programmes/" + data.episodes[i].programme.pid + "'></a>");
                $('.programme-image').last().html('<img src="http://ichef.bbci.co.uk/images/ic/150x84/' + data.episodes[i].programme.image.pid + '.jpg">');
                if (data.episodes[i].programme.programme.type === "brand") {
                    $('.programme-title').last().text(data.episodes[i].programme.programme.title);
                } else {
                    $('.programme-title').last().text(data.episodes[i].programme.programme.programme.title);
                }
                $('.programme-episode').last().text(data.episodes[i].programme.title);
                $('.programme-description').last().text(data.episodes[i].programme.short_synopsis);
                $('.programme-availability').last().text(data.episodes[i].programme.media.availability);
            }
    });
}
