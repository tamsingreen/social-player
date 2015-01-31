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

        // it('should return an empty array when user has no likes', function() {

        // });
        // it('should return an array of 25 when a user has 25 likes, which is the current Facebook pagination limit', function() {
        //     var ajaxRequest = jasmine.Ajax.requests.mostRecent();
        //     ajaxRequest.respondWith(TestResponses.listLikes.scenarioTwo);
        //     collateLikes();
        //     expect(fbLikes[2].id).toEqual('407214965992821');
        // });
        // it('should return an array of 76 likes when a user has 76 likes, separated over 4 pages', function() {

        // });
    });

});
