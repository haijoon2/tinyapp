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
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  const username = req.cookies ? req.cookies["username"] : undefined;
  const templateVars = {
    username,
    urls: urlDatabase
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:id", (req, res) => {
  const username = req.cookies ? req.cookies["username"] : undefined;
  const templateVars = {
    id: req.params.id,
    username,
    longURL: urlDatabase[req.params.id]
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});

app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id;

  // Use the delete operator to remove the URL from urlDatabase
  delete urlDatabase[id];

  // Redirect the client back to the urls_index page
  res.redirect("/urls");
});

app.post("/urls/:id", (req, res) => {
  const id = req.params.id;
  const longURL = req.body.longURL;
  urlDatabase[id] = longURL;
  const username = req.cookies ? req.cookies["username"] : undefined;

  const templateVars = {
    urls: urlDatabase,
    username
  };
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  res.send("Ok"); // Respond with 'Ok' (we will replace this)
});

app.post("/login", (req, res) => {
  const username = req.body.username;
  res.cookie('username', username);
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  res.clearCookie("username"); // Clear the username cookie
  res.redirect("/urls"); // Redirect the user back to the /urls page
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});