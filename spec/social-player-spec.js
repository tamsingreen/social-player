beforeEach(function () {
  jasmine.Ajax.install();
});

afterEach(function () {
  jasmine.Ajax.uninstall();
});

describe('Social Player', function() {
  window.FB = {
      api: jasmine.createSpy(),
      getLoginStatus: jasmine.createSpy(),
      login: jasmine.createSpy()
  }

  describe('Facebook login button clicked', function() {
    it('when I am already logged into Facebook and I have previously authorised the app, it calls listLikes with the userID parameter', function() {
      spyOn(window, 'listLikes');

      FB.getLoginStatus.and.callFake(function (callback) {
        callback({
          status: 'connected',
          authResponse: { userID: '12345'}
        });
      });
      
      facebookLogin();

      expect(window.listLikes).toHaveBeenCalledWith('12345');
    });

    it('when I am not already logged into Facebook and I have previously authorised the app, it calls listLikes with the userID parameter', function() {
      spyOn(window, 'listLikes');

      FB.getLoginStatus.and.callFake(function (callback) {
        callback({
          status: 'unknown'
        });
      });
      
      FB.login.and.callFake(function (callback) {
        callback({
          status: 'connected',
          authResponse: { userID: '12345'}
        });
      });

      facebookLogin();

      expect(window.listLikes).toHaveBeenCalledWith('12345');
    });

    it('when I am already logged into Facebook and I have not yet authorised the app, I grant all permissions and it calls listLikes with the userID parameter', function() {
      spyOn(window, 'listLikes');

      FB.getLoginStatus.and.callFake(function (callback) {
        callback({
          status: 'not_authorized'
        });
      });

      FB.login.and.callFake(function (callback) {
        callback({
          status: 'connected',
          authResponse: { userID: '12345'}
        });
      });

      facebookLogin();

      expect(window.listLikes).toHaveBeenCalledWith('12345');
    });

    it('when I am already logged into Facebook and I have not yet authorised the app, I decline permission and a message is displayed about permissions and the login button are displayed', function() {
      setFixtures(sandbox({id: 'loading-message'}));

      spyOn(window, 'listLikes');

      FB.getLoginStatus.and.callFake(function (callback) {
        callback({
          status: 'not_authorized'
        });
      });

      FB.login.and.callFake(function (callback) {
        callback({
          status: 'not_authorized'
        });
      });

      facebookLogin();

      expect($('#loading-message').text()).toEqual('Social Player needs permission to view your Facebook likes in order to find programmes to watch. Click the Find Programmes button to try again.');

      //TODO: check the login button is displayed
    });
  });

  describe('listLikes', function() {

    beforeEach(function() {
      fbLikes = [];
      categoryLikes = [];
    });

    it('should check I have given permission to access user_likes', function() {
      setFixtures(sandbox({id: 'loading-message'}));

      FB.api.and.callFake(function (url, cb) {
        console.log('url: ' + url);
        if (url.indexOf('permissions')) {
          cb({
            data: [{
                permission: 'public_profile',
                status: 'granted'
              }, {
                permission: 'user_likes',
                status: 'granted'
              }]
            });
        } else if (url.indexOf('likes')) {
          cb({
            data : [ { category: 'Tv show', id: '123' } ],
            paging: { next: false }
          });
        }
      });

      listLikes(123);

      expect(window.FB.api).toHaveBeenCalledWith('/123/permissions'); 
      expect($('#loading-message').text()).toEqual('Retrieving your likes from Facebook'); 
    });

    it('should call displayProgrammeMetadata with a bbc PID', function () {
      spyOn(window, 'displayProgrammeMetadata');

      FB.api.and.callFake(function (url, cb) {
        cb({
          data : [ { category: 'Tv show', id: '123' } ],
          paging: { next: false }
        });
      });

      jasmine.Ajax.stubRequest('/programmes/123').andReturn({
        "status": 200,
        "contentType": "application/json",
        "responseText": JSON.stringify({ bbcBrandPid: 456 })
      });

      listLikes(123);

      expect(window.displayProgrammeMetadata).toHaveBeenCalledWith(456);
    });


    it('should display a user-friendly message when likes are retrieved but no matching likes are found', function() {
      setFixtures(sandbox({id: 'loading-message'}));

      spyOn(window, 'displayProgrammeMetadata');

      FB.api.and.callFake(function (url, cb) {
        cb({
          data : [ { category: 'Tv show', id: '789' } ],
          paging: { next: false }
        });
      });

      jasmine.Ajax.stubRequest('/programmes/789').andReturn({
        "status": 200,
        "contentType": "application/json",
        "responseText": null
      });

      listLikes(123);
      
      jQuery.event.trigger( "ajaxStop" );

      expect($('#loading-message').text()).toEqual('No iPlayer programmes matching your likes could be found.');
    });

    it('should display a user-friendly message when no user likes are found', function() {
      setFixtures(sandbox({id: 'loading-message'}));

      spyOn(window, 'displayProgrammeMetadata');
      
      FB.api.and.callFake(function (url, cb) {
        cb({
          data : [ { category: 'Musician/band', id: '789' } ],
          paging: { next: false }
        });
      });

      listLikes(123);

      expect($('#loading-message').text()).toEqual('No TV programmes were found in your Facebook likes.');
    });
  });

});
