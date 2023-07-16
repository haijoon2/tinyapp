const generateRandomString = () => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';

  for (let i = 0; i < 6; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters.charAt(randomIndex);
  }

  return result;
};

const express = require("express");
const cookieParser = require('cookie-parser'); // Import the cookie-parser module
const bcrypt = require('bcrypt'); // Import the bcrypt module
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    userID: "userRandomID"
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    userID: "user2RandomID"
  }
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "a@hotmail.com",
    password: "$2b$10$0hkaPo/jBAnfKKO3ePeV9e6m..F1nZHAZm1um6LG1myT4EhPMxdOq", //aa
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "b@hotmail.com",
    password: "$2b$10$FahsimwCsMUCeHD56gHKsONDy0HJ08LgexFWHlIUoeDBGvsdkWJ42",//bb
  },
};

const getUserByEmail = (email) => {
  const keys = Object.keys(users);
  for (const key of keys) {
    if (users[key].email === email) {
      return users[key];
    }
  }
  return undefined;
};

const urlsForUser = (id) => {
  const urls = {};
  const keys = Object.keys(urlDatabase);
  for (const key of keys) {
    if (urlDatabase[key].userID === id) {
      urls[key] = urlDatabase[key];
    }
  }
  return urls;
};

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  const email = req.cookies ? req.cookies["email"] : undefined;
  const user = getUserByEmail(email);
  res.json(urlsForUser(user.id));
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  const email = req.cookies ? req.cookies["email"] : undefined;
  const user = getUserByEmail(email);

  if (!user) {
    res.redirect("/login");
    return;
  }

  const  templateVars = {
    user,
    urls: urlsForUser(user.id)
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const email = req.cookies ? req.cookies["email"] : undefined;
  const user = getUserByEmail(email);

  if (!user) {
    res.redirect("/login");
    return;
  }

  const  templateVars = {
    user,
    urls: urlsForUser(user.id)
  };
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  const email = req.cookies ? req.cookies["email"] : undefined;
  const user = getUserByEmail(email);
  const id = req.params.id;

  if (!urlDatabase[id]) {
    res.status(404).send("<h1>URL not found</h1>");
    return;
  }

  if (!user) {
    res.status(401).send("<h1>Please login or register</h1>");
    return;
  }

  if (urlDatabase[id].userID !== user.id) {
    res.status(403).send("<h1>You do not have permission to edit this URL</h1>");
    return;
  }

  const templateVars = {
    id,
    user,
    longURL: urlDatabase[id].longURL
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id].longURL;

  if (!longURL) {
    res.status(404).send("<h1>URL not found</h1>");
    return;
  }
  res.redirect(longURL);
});

app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id;
  const email = req.cookies ? req.cookies["email"] : undefined;
  const user = getUserByEmail(email);

  if (!user) {
    res.status(401).send("Please login or register");
    return;
  }

  if (urlDatabase[id].userID !== user.id) {
    res.status(403).send("You do not have permission to delete this URL");
    return;
  }

  delete urlDatabase[id];  // Use the delete operator to remove the URL from urlDatabase

  res.redirect("/urls");  // Redirect the client back to the urls_index page
});

app.post("/urls/:id", (req, res) => {
  const id = req.params.id;
  const longURL = req.body.longURL;
  const email = req.cookies ? req.cookies["email"] : undefined;
  const user = getUserByEmail(email);

  urlDatabase[id] = {
    longURL,
    userID: user.id
  };

  if (urlDatabase[id].userID !== user.id) {
    res.status(403).send("You do not have permission to edit this URL");
    return;
  }

  const templateVars = {
    urls: urlsForUser(user.id),
    user
  };
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  const email = req.cookies ? req.cookies["email"] : undefined;
  const user = getUserByEmail(email);

  if (!user) {
    res.status(403).send("Please login or register");
    return;
  }
  
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = {
    longURL: req.body.longURL,
    userID: user.id
  };
  res.redirect(`/urls/${shortURL}`);
});

app.get("/login", (req, res) => {
  const email = req.cookies ? req.cookies["email"] : undefined;
  const user = getUserByEmail(email);

  if (user) {
    res.redirect("/urls");
    return;
  }

  const templateVars = {
    user: undefined
  };
  res.render("login", templateVars);
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = getUserByEmail(email);

  if (!user) {
    res.status(403).send("<h1>Email not found</h1>");
    return;
  }

  const passwordMatch = bcrypt.compareSync(password, user.password); // Compare the password with the hashed password

  if (!passwordMatch) {
    res.status(403).send("<h1>Password incorrect</h1>");
    return;
  }

  // if (user.password !== password) {
  //   res.status(403).send("<h1>Password incorrect</h1>");
  //   return;
  // }

  res.cookie('email', email);
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  res.clearCookie("email"); // Clear the email cookie
  res.redirect("/login"); // Redirect the user back to the /urls page
});

app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const userID = generateRandomString();

  if (!email || !password) {
    res.status(400).send("Email or Password cannot be empty");
  }

  if (getUserByEmail(email)) {
    res.status(400).send("Email already exists");
  }
  
  const hashedPassword = bcrypt.hashSync(password, 10); // Hash the password

  users[userID] = {
    id: userID,
    email,
    password: hashedPassword // Store the hashed password
  };

  res.cookie('email', email);
  res.redirect("/urls");
});

app.get("/register", (req, res) => {
  const email = req.cookies ? req.cookies["email"] : undefined;
  const user = getUserByEmail(email);

  if (user) {
    res.redirect("/urls");
    return;
  }

  const templateVars = {
    user
  };
  res.render("register", templateVars);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
