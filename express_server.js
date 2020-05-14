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
  "b2xVn2": { longURL: 'http://www.lighthouselabs.ca', userID: 'user1'},
  "9sm5xK": { longURL: 'http://google.com', userID: 'user1'},
  "b6UTxQ": { longURL: 'http://www.tsn.ca', userID: 'user2'}
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
      return user;
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
  console.log("urls", templateVars.urls);

  res.render("urls_index", templateVars);
});

app.get('/urls/new', (req, res) => {
  const user = usersDatabase[req.cookies.user_id];
  let templateVars = {
    user: user
  };
  if (user === undefined) {
    res.redirect('/login');
  } else {
    res.render("urls_new", templateVars);
  }
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
  let redirectURL = urlDatabase[req.params.shortURL]['longURL'];
  console.log("req.params", urlDatabase[req.params.shortURL]['longURL']);
 
  res.redirect(redirectURL);
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
  const { email, password } = req.body;
  if (checkForEmail(email)) {
    let user = usersDatabase[checkForEmail(email)];

    if (user.email === email && user.password === password) {
      res.cookie('user_id', user.id);
      res.redirect('/');
    } else {
      res.status(403);
      res.send('Ew, I don\'t like that');
    }

  } else {
    res.status(403);
    res.send('Sorry, I couldn\'t find that user');
  }
});

app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});