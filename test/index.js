process.env.NODE_ENV = 'test';

const chai = require('chai'),
      chaiHttp = require('chai-http'),
      sinon = require('sinon'),
      sandbox = sinon.sandbox.create(),
      app = require('../app.js'),
      dbClient = require('../lib/dbClient.js'),
  		dao = require('../lib/dao'),
      should = chai.should();

const episodeData = require('./fixtures/episodes');
const renderedEpisodes = require('./fixtures/renderedEpisodes');

chai.use(chaiHttp);

describe('index', () =>{
  afterEach(() => {
    sandbox.restore();
  });

  describe('POST /programmes', () => {
    it('should return an array of matching pids', (done) => {
      const fbIds = { fbIds: ['260212261199', '169383494938']};
      const pids = ['orange', 'apple'];
      const daoStub = sandbox.stub(dao, 'matchProgrammes').returns(Promise.resolve(pids));

      chai.request(app)
        .post('/programmes')
        .send(fbIds)
        .end((err, res) => {
          daoStub.calledWith(fbIds).should.equal(true);
          res.should.have.status(200);
          res.should.be.JSON;
          res.body.should.be.a('array');
          res.body.should.deep.equal(pids);
          done();
        });
    });

    it('should return an empty array when there are no matching pids', (done) => {
      const fbIds = { fbIds: ['260212261199', '169383494938']};
      const pids = [];
      const daoStub = sandbox.stub(dao, 'matchProgrammes').returns(Promise.resolve(pids));

      chai.request(app)
        .post('/programmes')
        .send(fbIds)
        .end((err, res) => {
          daoStub.calledWith(fbIds).should.equal(true);
          res.should.have.status(200);
          res.should.be.JSON;
          res.body.should.be.a('array');
          res.body.should.deep.equal(pids);
          done();
        });
    });

    it('should return a 500 when there is a database error', (done) => {
      const fbIds = { fbIds: ['260212261199', '169383494938']};
      const daoStub = sandbox.stub(dao, 'matchProgrammes').returns(Promise.reject('Something went wrong'));

      chai.request(app)
        .post('/programmes')
        .send(fbIds)
        .end((err, res) => {
          daoStub.calledWith(fbIds).should.equal(true);
          res.should.have.status(500);
          done();
        });
    });

    it.skip('should return an error for an invalid body', () => {

    });
  });

  describe('GET /episodes/:pid', () => {
    const pid = 'somepid';

    it('calls the DAO with the supplied pid', (done) => {
      const daoStub = sandbox.stub(dao, 'getiPlayerEpisodes').returns(Promise.resolve(episodeData));

      chai.request(app)
        .get('/episodes/' + pid)
        .end((err, res) => {
          daoStub.calledWith(pid).should.equal(true);
          done();
        });
    });

    it('returns rendered episode data', (done) => {
      const daoStub = sandbox.stub(dao, 'getiPlayerEpisodes').returns(Promise.resolve(episodeData));

      chai.request(app)
        .get('/episodes/' + pid)
        .end((err, res) => {
          res.should.have.status(200);
          res.should.be.html;
          res.text.should.equal(renderedEpisodes);
          done();
        });
    });

    it('does something when the request to iPlayer fails', (done) => {
      const daoStub = sandbox.stub(dao, 'getiPlayerEpisodes').returns(Promise.reject());

      chai.request(app)
        .get('/episodes/' + pid)
        .end((err, res) => {
          res.should.have.status(500);
          done();
        });
    });
  });

});
