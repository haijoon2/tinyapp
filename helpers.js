/**
 * Returns a user object if the email is found
 * in the database, otherwise returns undefined.
 */
const getUserByEmail = (email, userDataBase) => {
  const users = Object.values(userDataBase);
  for (const user of users) {
    if (user.email === email) {
      return user;
    }
  }
  return undefined;
};

/**
 * Returns a random string of 6 alphanumeric characters.
 */
const generateRandomString = () => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';

  for (let i = 0; i < 6; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters.charAt(randomIndex);
  }

  return result;
};

/**
 * Returns an object containing only the URLs where the userID
 * is equal to the id of the currently logged-in user.
 */
const urlsForUser = (id, urlDatabase) => {
  const urls = {};
  for (const key in urlDatabase) {
    if (urlDatabase[key].userID === id) {
      urls[key] = urlDatabase[key];
    }
  }
  return urls;
};

module.exports = { getUserByEmail, generateRandomString, urlsForUser };