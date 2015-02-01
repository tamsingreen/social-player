var fbLikes = [];
var categoryLikes = [];
var bbcResults = [];

//Login in to user's Facebook, requesting the 'user_likes' scope if not already granted
function facebookLogin() {
    FB.getLoginStatus(function(response) {
        if (response.status === 'connected') {
            $('#login').toggle();
            $('.loading').toggle();
            listLikes(response.authResponse.userID);
        } else {
            FB.login(function(response) {
                $('#login').toggle();
                $('.loading').toggle();
                listLikes(response.authResponse.userID);
            }, {scope: 'user_likes'});
        }
    });
    //TODO: Handle login errors
}

//Request a list of the user's Facebook likes and pass them to collateLikes()
function listLikes(fbUserID) {
    var uri = '/' + fbUserID + '/likes';
    $('#loading-message').text('Retrieving your likes from Facebook');
    FB.api(uri, collateLikes);
}

//Page through Facebook likes and collate in fbLikes array
function collateLikes(response) {   
    for (element in response.data) {
        fbLikes.push(response.data[element]);        
    }
    if (response.paging.next) {
        $.get(response.paging.next, collateLikes, 'json');
    } else {
        //when complete
        searchCategories('Tv show');
    }
    console.log(fbLikes);
    console.log(categoryLikes);
}

//Search the user's fbLikes for all matching the specified category (usually 'Tv show')
function searchCategories(category) {
    $('#loading-message').text('Searching for your favourite TV shows');
    for (var i = 0; i < fbLikes.length; i++) {
        if (fbLikes[i].category === category) {
            categoryLikes.push(fbLikes[i]);
        }
    }
    if (categoryLikes.length === 0) {
        $('#spinner').toggle();
        $('#loading-message').text('No TV programmes were found in your Facebook likes.');
    } else {
        searchBBCProgrammes(function() {
            $('.loading').toggle();
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
        console.log('ajaxStop triggered');
        if (matchingProgrammesFound > 0) {
            callback();
        } else {
            $('#spinner').toggle();
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