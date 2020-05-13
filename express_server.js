const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 8080;

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

const generateRandomString = function() {
  let seed = Math.random().toString(36);
  return seed.slice(2, 7);
};

const urlDatabase = {
  "b2xVn2": 'http://www.lighthouselabs.ca',
  "9sm5xK": 'http://google.com'
};

const usersDatabase = {
  'user1': {
    id: 'user1',
    email: 'user@example.com',
    password: 'purple-monkey-dinosaur'
  },
  'user2': {
    id: 'user2',
    email: 'user2@example.com',
    password: 'dishwasher-funk'
  }
};

const checkForEmail = function(passedEmail) {
  for (const user in usersDatabase) {
    if (usersDatabase[user]['email'] === passedEmail) {
      return true;
    }
  }
  return false;
};

app.get('/', (req, res) => {
  res.redirect('/urls');
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get('/urls', (req, res) => {
  const user = usersDatabase[req.cookies.user_id];
  let templateVars = {
    urls: urlDatabase,
    user: user
  };


  res.render("urls_index", templateVars);
});

app.get('/urls/new', (req, res) => {
  const user = usersDatabase[req.cookies.user_id];
  let templateVars = {
    user: user
  };
  res.render("urls_new", templateVars);
});

//registration page
app.get('/register', (req, res) => {
  const user = usersDatabase[req.cookies.user_id];
  let templateVars = {
    user: user
  };
  res.render("register", templateVars);
});

//submit registration
app.post('/register', (req, res) => {


  let { email, password } = req.body;
  if (email === '' || password === '') {
    res.status(400);
    res.send('Invalid email or password entered. Please <a href ="/register">register</a> again');

  } else if (checkForEmail(email)) {
    res.status(400);
    res.send('Someone has already registered with that email. Please <a href="#">log in<a>, or <a href ="/register">register</a> with a different email');
    //setTimeout(() => res.redirect('/register'), 3500);
    return;
  
  } else {
    let seed = generateRandomString();
    usersDatabase[seed] = { email, password, id: seed};
    res.cookie('user_id', seed);
    res.redirect('/urls');
  }
});

//Pass database to urls_show template w/ templateVars
app.get('/urls/:shortURL', (req, res) => {
  const user = usersDatabase[req.cookies.user_id];
  let templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase,
    user: user
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

//Login
app.get('/login', (req, res) => {
  const user = usersDatabase[req.cookies.user_id];
  let templateVars = {
    user: user
  };
  res.render('login', templateVars);
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