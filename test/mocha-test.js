process.env.NODE_ENV = 'test';

var chai = require('chai')
chaiHttp = require('chai-http'),
app = require('../app.js'),
dbClient = require('../dbClient.js'),
should = chai.should(),
db;
chai.use(chaiHttp);


// describe('Array', function() {
//   describe('#indexOf()', function () {
//     it('should return -1 when the value is not present', function () {
//       assert.equal(-1, [1,2,3].indexOf(5));
//       assert.equal(-1, [1,2,3].indexOf(0));
//     });
//   });
// });

//take an array of Facebook 'TV show' page IDs and match them against BBC PIDs in the db

//200 for successful completed requests - 0+ item arrays
//400 for malformed requests

// beforeEach(function(done) {
//   db.drop();
//   done();
// });
// afterEach(function(done){
//   db.programmelist.drop();
//   done();
// });

//befre: drop db
describe('getBBCBrandPids', function() {
  before(function() {
    console.log('================')
    db = dbClient.getDB();
    db.collection('programmelist').insert(
      [{ "fbId" : "260212261199", "fbCategory" : "Tv show", "fbName" : "BBC Newsnight!!!!!", "bbcBrandPid" : "b006mk25" },
      { "fbId" : "144513172354395", "fbCategory" : "Tv show", "fbName" : "The Fall (TV series)", "bbcBrandPid" : "p0295tcf" },
      { "fbId" : "169383494938", "fbCategory" : "Tv show", "fbName" : "BBC Eastenders", "bbcBrandPid" : "b006m86d" }]
      , function(err, res) {
        if (err) {
          console.log('failed to insert');
        } else {
          console.log('insert succeeded');
        }
      }
    );
  });

  it('should return a JSON array of matching results', function(done) {
    chai.request(app)
      .post('/programmes')
      .send({ fbId: '260212261199'}, {fbId: '169383494938' })
      .end(function(err, res) {
        // console.log(res);
        res.should.have.status(200);
        res.should.be.JSON;
        res.body.should.be.a('array');
        res.body[0].should.have.property('bbcBrandPid');
        res.body[0].bbcPid.should.equal('b006mk25');
        done();
      });
  });
  it('should return an empty array when no results match', function(done) {
    chai.request(app)
      .post('/programmes')
      .send({ fbId: '123'}, {fbId: '456' })
      .end(function(err, res) {
        expect(res).to.have.status(200);
        expect(res.body).to.be.JSON;
        done();
      });
  });
  it('should return a 400 if the request is not valid', function(done) {
    chai.request(app)
      .post('/programmes')
      .send({ fbId: '123'}, {fbId: '456' })
      .end(function(err, res) {
        expect(res).to.have.status(200);
        expect(res.body).to.be.JSON;
        done();
      });
  });
});
