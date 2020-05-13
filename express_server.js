const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 8080;

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

const generateRandomString = function () {
  let seed = Math.random().toString(36);
  return seed.slice(2, 7);
};

const urlDatabase = {
  "b2xVn2": 'http://www.lighthouselabs.ca',
  "9sm5xK": 'http://google.com'
};

const users = {
  'user1': {
    id: 'user1',
    email: 'user.example.com',
    password: 'purple-monkey-dinosaur'
  },
  'user2': {
    id: 'user2',
    email: 'user2@example.com',
    password: 'dishwasher-funk'
  }
};

app.get('/', (req, res) => {
  res.redirect('/urls');
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get('/urls', (req, res) => {
  let templateVars = {
    urls: urlDatabase,
    username: req.cookies.username
  };
  res.render("urls_index", templateVars);
});

app.get('/urls/new', (req, res) => {
  let templateVars = {
    username: req.cookies.username
  };
  res.render("urls_new", templateVars);
});

app.get('/register', (req, res) => {
  let templateVars = {
    username: req.cookies.username
  };
  res.render("register", templateVars);
});
//Pass database to urls_show template w/ templateVars
app.get('/urls/:shortURL', (req, res) => {
  let templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase,
    username: req.cookies.username
  };
  res.render("urls_show", templateVars);
});

//Generate a new short url / redirect to shortURL page
app.post("/urls", (req, res) => {
  let makeString = generateRandomString();
  urlDatabase[makeString] = req.body['longURL'];
  res.redirect(`/urls/${makeString}`);
});

//Redirect users to the real website of short urls
app.get('/u/:shortURL', (req, res) => {
  let longURL = urlDatabase[req.params['shortURL']];
  res.redirect(longURL);
});

//Delete
app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect('/urls');
});

//Edit
app.post('/u/:shortURL/update', (req, res) => {
  const { newURL } = req.body;
  urlDatabase[req.params.shortURL] = newURL;
  res.redirect(`/urls`);
});

app.post('/login', (req, res) => {
  const { username } = req.body;
  res.cookie('username', username);
  res.redirect('/urls');
});

app.post('/logout', (req, res) => {
  res.clearCookie('username');
  res.redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});