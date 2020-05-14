const getUserByEmail = function(passedEmail, database) {
  for (const user in database) {
    if (database[user]['email'] === passedEmail) {
      return user;
    }
  }
  return false;
};


const generateRandomString = function() {
  let seed = Math.random().toString(36);
  return seed.slice(2, 7);
};

const dataFilter = (obj, valueToFilter, keyOfValue) => {
  const filtered = {};
  for (const key in obj) {
    if (obj[key][keyOfValue] === valueToFilter) {
      filtered[key] = obj[key];
    }
  }
  return filtered;
};



module.exports = {
  getUserByEmail,
  generateRandomString,
  dataFilter
};