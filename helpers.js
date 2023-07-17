const getUserByEmail = (email, userDataBase) => {
  const users = Object.values(userDataBase);
  for (const user of users) {
    if (user.email === email) {
      return user;
    }
  }
  return undefined;
};

module.exports = { getUserByEmail };