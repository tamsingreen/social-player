beforeEach(function () {
    jasmine.Ajax.install();
    window.fbAsyncInit = function() {
        FB.init({
          appId      : 'your-app-id',
          xfbml      : true,
          version    : 'v2.1'
        });
    };

    (function(d, s, id){
         var js, fjs = d.getElementsByTagName(s)[0];
         if (d.getElementById(id)) {return;}
         js = d.createElement(s); js.id = id;
         js.src = "//connect.facebook.net/en_US/sdk.js";
         fjs.parentNode.insertBefore(js, fjs);
    }(document, 'script', 'facebook-jssdk'));
    //fbUserId = "10152948259833216";
    facebookLogin();
    FB.api('/10152948259833216/likes');
});

afterEach(function () {
  jasmine.Ajax.uninstall();
});

describe("Social Player", function() {

    describe('listLikes', function() {
        // it('should return an empty array when user has no likes', function() {

        // });
        it('should return an array of 25 when a user has 25 likes, which is the current Facebook pagination limit', function() {
            var ajaxRequest = jasmine.Ajax.requests.mostRecent();
            ajaxRequest.respondWith(TestResponses.listLikes.scenarioTwo);
            collateLikes();
            expect(fbLikes[2].id).toEqual('407214965992821');
        });
        // it('should return an array of 76 likes when a user has 76 likes, separated over 4 pages', function() {

        // });
    });

});
