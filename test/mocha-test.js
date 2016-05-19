process.env.NODE_ENV = 'test';

var chai = require('chai'),
    chaiHttp = require('chai-http'),
    app = require('../app.js'),
    dbClient = require('../lib/dbClient.js'),
    should = chai.should(),
    db;

chai.use(chaiHttp);

describe('POST /programmes', function() {
  beforeEach(function(done) {
    if (db) {
      populateDatabase(function() {
        done();
      });
    } else {
      dbClient.database.once('connected', function() {
        db = dbClient.getDB();
        populateDatabase(function() {
          done();
        });
      });
    }
  });

  afterEach(function(done) {
    db.collection('programmelist').drop();
    done();
  });

  it('should return a JSON array of matching results', function(done) {
    chai.request(app)
      .post('/programmes')
      .send({ fbIds: ['260212261199', '169383494938']})
      .end(function(err, res) {
        console.log('body', res.body);
        res.should.have.status(200);
        res.should.be.JSON;
        res.body.bbcBrandPids.should.be.a('array');
        res.body.bbcBrandPids[0].should.equal('b006mk25');
        res.body.bbcBrandPids[1].should.equal('b006m86d');
        done();
      });
  });
  it('should return an empty array when no results match', function(done) {
    chai.request(app)
      .post('/programmes')
      .send({fbIds: ['123', '456']})
      .end(function(err, res) {
        res.should.have.status(200);
        res.should.be.JSON;
        res.body.bbcBrandPids.should.be.a('array');
        res.body.bbcBrandPids.length.should.equal(0);
        done();
      });
  });
  it('should return an empty array when an empty array is sent', function(done) {
    chai.request(app)
      .post('/programmes')
      .send({fbIds: []})
      .end(function(err, res) {
        res.should.have.status(200);
        res.should.be.JSON;
        res.body.bbcBrandPids.should.be.a('array');
        res.body.bbcBrandPids.length.should.equal(0);
        done();
      });
  });
  //sort out what the request schema is
  it('should return a 400 if the request does not match the request schema', function(done) {
    chai.request(app)
      .post('/programmes')
      .send([{ notValid: '123'}])
      .end(function(err, res) {
        res.should.have.status(400);
        done();
      });
  });
  it('should return a 400 if the request is not an array', function(done) {
    chai.request(app)
      .post('/programmes')
      .send({ notValid: '123'})
      .end(function(err, res) {
        res.should.have.status(400);
        done();
      });
  });
});

var populateDatabase = function(done) {
  db.collection('programmelist').insert(
    [{ "fbId" : "260212261199", "fbCategory" : "Tv show", "fbName" : "BBC Newsnight", "bbcBrandPid" : "b006mk25" },
    { "fbId" : "144513172354395", "fbCategory" : "Tv show", "fbName" : "The Fall (TV series)", "bbcBrandPid" : "p0295tcf" },
    { "fbId" : "169383494938", "fbCategory" : "Tv show", "fbName" : "BBC Eastenders", "bbcBrandPid" : "b006m86d" }]
    , function(err, res) {
      if (err) {
        console.log('Failed to insert test data: ' + err);
      }
      done();
    }
  );
}
