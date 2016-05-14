process.env.NODE_ENV = 'test';

var chai = require('chai'),
    chaiHttp = require('chai-http'),
    app = require('../app.js'),
    dbClient = require('../dbClient.js'),
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
      .send([{ fbId: '260212261199'}, {fbId: '169383494938' }])
      .end(function(err, res) {
        res.should.have.status(200);
        res.should.be.JSON;
        res.body.should.be.a('array');
        res.body[0].should.have.property('bbcBrandPid');
        res.body[0].bbcBrandPid.should.equal('b006mk25');
        res.body[1].should.have.property('bbcBrandPid');
        res.body[1].bbcBrandPid.should.equal('b006m86d');
        done();
      });
  });
  it('should return an empty array when no results match', function(done) {
    chai.request(app)
      .post('/programmes')
      .send([{ fbId: '123'}, {fbId: '456' }])
      .end(function(err, res) {
        res.should.have.status(200);
        res.should.be.JSON;
        res.body.should.be.a('array');
        res.body.length.should.equal(0);
        done();
      });
  });
  it('should return an empty array when an empty array is sent', function(done) {
    chai.request(app)
      .post('/programmes')
      .send([])
      .end(function(err, res) {
        res.should.have.status(200);
        res.should.be.JSON;
        res.body.should.be.a('array');
        res.body.length.should.equal(0);
        done();
      });
  });
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
        console.log('failed to insert: ' + err);
      }
      done();
    }
  );
}
