const chai = require('chai'),
      sinon = require('sinon'),
      request = require('request-promise'),
      Promise = require('bluebird'),
      dao = require('../lib/dao'),

      should = chai.should(),
      sandbox = sinon.sandbox.create();

describe('dao', () => {
  const pid = 'somepid',
        episodesResponse = { some: "iplayer", episode: "data" },
        emptyResponse = {};

  afterEach(() => {
    sandbox.restore();
  });

  describe('getiPlayerEpisodes', () => {
    it('should call the iPlayer API with the supplied pid', (done) => {
      const requestStub = sandbox.stub(request, 'get').returns(Promise.resolve(episodesResponse));

      dao.getiPlayerEpisodes(pid).then((result) => {
        requestStub.calledWith('http://www.bbc.co.uk/programmes/' + pid + '/episodes/player.json').should.equal(true);
        done();
      });
    });

    it('should return an object containing iPlayer episodes', (done) => {
      sandbox.stub(request, 'get').returns(Promise.resolve(episodesResponse));

      dao.getiPlayerEpisodes(pid).then((result) => {
        result.should.equal(episodesResponse);
        done();
      });
    });

    //check what response from iplayer if no episodes available
    it('should return an empty object when iPlayer returns no data', (done) => {
      sandbox.stub(request, 'get').returns(Promise.resolve(emptyResponse));

      dao.getiPlayerEpisodes(pid).then((result) => {
        result.should.equal(emptyResponse);
        done();
      });
    });

    it('should fail when the iPlayer request fails', (done) => {
      const expectedError = 'Something went wrong';
      sandbox.stub(request, 'get').returns(Promise.reject(expectedError));

      dao.getiPlayerEpisodes(pid).catch((error) => {
        error.should.equal(expectedError);
        done();
      });
    });
  });
});
