import { default as testSetup } from '../../fixtures/testSetup'
var fs = require('fs-extra');
var path = require('path');
var testPath = path.join(__dirname, '..', '..', 'tmp');
var testDb;

describe('Database opening tests', function(done) {

  function verifyTableExists(db) {
    var statement = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name=?");
    var results = statement.get(['mytable']);
    if(!results) {
      return false;
    }
    return true;
  }

  function createTable(db, done) {
    var create = 'CREATE TABLE mytable ('+
    '  name TEXT NOT NULL,'+
    '  id INTEGER NOT NULL PRIMARY KEY,'+
    '  description TEXT'+
    ')';
    try {
      var statement = db.prepare(create);
      statement.run();
      done();
    } catch (e) {
      done(e);
    }
  }

  var db;

  beforeEach(async function() {
    testDb = path.join(testPath, testSetup.createTempName());
    let gp = await testSetup.createGeoPackage(testDb);
    db = gp.getDatabase().getDBConnection();
  });

  afterEach(async function() {
    await testSetup.deleteGeoPackage(testDb);
  });

  it('should load a file synchronusly then write to the db', function(done) {
    createTable(db, function(err, results) {
      var exists = verifyTableExists(db);
      if (!exists) return done(new Error('Table does not exist'));
      var buffer = fs.readFileSync(path.join(__dirname, '..', '..', 'fixtures', 'tiles', '0', '0', '0.png'));
      exists = verifyTableExists(db);
      if (!exists) return done(new Error('Table does not exist after file read'));
      return done();
    });
  });

  it('should load a file asynchronusly then write to the db', function(done) {
    createTable(db, function(err, results) {
      var exists = verifyTableExists(db);
      if (!exists) return done(new Error('Table does not exist'));
      fs.readFile(path.join(__dirname, '..', '..', 'fixtures', 'tiles', '0', '0', '0.png'), function(err, buffer) {
        exists = verifyTableExists(db);
        if (!exists) return done(new Error('Table does not exist after file read'));
        return done();
      });
    });
  });
});
