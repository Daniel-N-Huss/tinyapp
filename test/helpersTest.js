const { assert } = require('chai');

const { getUserByEmail, generateRandomString, dataFilter } = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: 'userRandomID',
    email: 'user@example.com',
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: 'user2RandomID',
    email: 'user2@example.com',
    password: "dishwasher-funk"
  }
};

describe('getUserByEmail',function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail("user@example.com", testUsers);
    const expectedOutput = "userRandomID";
    assert.equal(user, expectedOutput);
  });

  it('should return false with an invalid email', function() {
    const user = getUserByEmail("notanexample@example.com", testUsers);
    const expectedOutput = false;
    assert.equal(user, expectedOutput);
  });

  it('should return false when not passed a value', function() {
    const user = getUserByEmail('', testUsers);
    const expectedOutput = false;
    assert.equal(user, expectedOutput);
  });
});

describe('generateRandomString', function() {

  it('should not return the same value when called twice', function() {
    const string1 = generateRandomString();
    const string2 = generateRandomString();
    assert.notStrictEqual(string1, string2);
  });

  it('should return a string and the string should be 5 characters long', function() {

    const string = generateRandomString();

    assert.equal(string.length, 5) &&
    assert.equal((typeof string), 'string');
  });
});

describe('dataFilter', function() {

  it('should return a nested object with all keys containing a provided userID value', function() {

    const filteredUsers = dataFilter(testUsers, 'userRandomID');
    const expectedOutput = {
      "userRandomID": {
        id: 'userRandomID',
        email: 'user@example.com',
        password: "purple-monkey-dinosaur"
      }
    };
    assert.equal(filteredUsers, expectedOutput);
  });
});