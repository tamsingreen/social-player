beforeEach(function () {
  jasmine.Ajax.install();
});

afterEach(function () {
  jasmine.Ajax.uninstall();
});

describe("Social Player", function() {
  window.FB = {
      api: jasmine.createSpy()
  }

  describe('listLikes', function() {

    beforeEach(function() {
      fbLikes = [];
      categoryLikes = [];
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

      listLikes();

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

      listLikes();
      
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

      // jasmine.Ajax.stubRequest('/programmes/789').andReturn({
      //   "status": 200,
      //   "contentType": "application/json",
      //   "responseText": null
      // });

      listLikes();
      
      //jQuery.event.trigger( "ajaxStop" );

      expect($('#loading-message').text()).toEqual('No TV programmes were found in your Facebook likes.');
    });

  });

});
