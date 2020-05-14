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

const dataFilter = (obj, ID) => {
  const filtered = {};
  for (const shortURL in obj) {
    if (obj[shortURL]['userID'] === ID) {
      filtered[shortURL] = obj[shortURL];
    }
  }
  return filtered;
};



module.exports = {
  getUserByEmail,
  generateRandomString,
  dataFilter
};