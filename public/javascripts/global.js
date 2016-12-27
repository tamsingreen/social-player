var fbLikes = [];
var categoryLikes = [];
//TODO get rid of globals

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
    var permissionGranted = false;
    for (var i = 0; i < response.data.length; i++) {
      if (response.data[i].permission === 'user_likes' && response.data[i].status === 'granted') {
          permissionGranted = true;
          $('#loading-message').text('Retrieving your likes from Facebook');
          fbLikes = []; //reset before we call collateLikes
          FB.api('/' + fbUserID + '/likes', collateLikes);
      }
    }
    if (!permissionGranted) {
      $('#loading-message').text('It looks like we don\'t have your permission to access your Facebook likes. If you\'d like to try again, please login again and grant all requested permissions.');
    }
  });
}

//Page through Facebook likes and collate in fbLikes array
//TODO: specify category by param?
function collateLikes(response) {
  for (var i = 0; i < response.data.length; i++) {
    if (response.data[i].category.toUpperCase() === 'TV SHOW') {
      fbLikes.push(response.data[i].id);
    }
  }
  if (response.paging.next) {
    $.get(response.paging.next, collateLikes, 'json');
  } else {
    //when complete
    if (fbLikes.length === 0) {
      $('#spinner').hide();
      $('#loading-message').text('No TV programmes were found in your Facebook likes.');
    } else {
      bbcResults = []; //reset before we call searchBBCProgrammes
      searchBBCProgrammes(function() {
        $('.loading').hide();
        $('#login-button').hide();
      });
    }
  }
}

//For each programme in categoryLikes, send the id property to the /programmes endpoint, and if the result is non-null, add the BBC brand PID to bbcResults and call displayProgrammeMetadata
function searchBBCProgrammes(callback) {
  $('#loading-message').text('Searching for your favourite TV shows from the BBC');
  $.ajax({
    type: "post",
    url: "/programmes",
    data: {fbIds: fbLikes},
    traditional: true,
    dataType: "json"})
    .done(function(data) {
      if (data) {
        fetchIplayerData(data.bbcBrandPids);
        callback();
      }
  });
}

function fetchIplayerData(bbcBrandPids) {
  console.log('bbcBrandPids: ', bbcBrandPids)
  for (var i = 0; i < bbcBrandPids.length; i++) {
    getIPlayerData(bbcBrandPids[i]);
  }
}

//move this server side and cache results?
function getIPlayerData(bbcBrandPid) {
  console.log('bbcBrandPid: ', bbcBrandPid);
  $.get('http://www.bbc.co.uk/programmes/' + bbcBrandPid + '/episodes/player.json')
    .done(function(data) {
      displayProgrammeMetadata(data);
  });
}

function displayProgrammeMetadata(data) {
  var programme = $('.programme-master').html();
  for (var i = 0; i < data.episodes.length; i++) {
    $('#programme-container').append(programme);
    $('.programme').last().wrap("<a href='http://www.bbc.co.uk/programmes/" + data.episodes[i].programme.pid + "'></a>");
    $('.programme__image').last().html('<img src="http://ichef.bbci.co.uk/images/ic/150x84/' + data.episodes[i].programme.image.pid + '.jpg">');
    if (data.episodes[i].programme.programme.type === "brand") {
      $('.programme__title').last().text(data.episodes[i].programme.programme.title);
    } else {
      $('.programme__title').last().text(data.episodes[i].programme.programme.programme.title);
    }
    $('.programme__episode').last().text(data.episodes[i].programme.title);
    $('.programme__description').last().text(data.episodes[i].programme.short_synopsis);
    $('.programme-days-remaining').last().text(data.episodes[i].programme.media.availability);
  }
}
