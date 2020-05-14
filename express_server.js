const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const cookieSession = require('cookie-session');
const { getUserByEmail, generateRandomString, dataFilter } = require('./helpers');


const app = express();
const PORT = 8080;


app.set("view engine", "ejs");


app.use(cookieSession({
  name: 'tinyAppSession',
  secret: 'q4CfhXplA'
}));
app.use(bodyParser.urlencoded({extended: true}));


const urlDatabase = {
  "b2xVn2": { longURL: 'http://www.lighthouselabs.ca', userID: 'user1'},
  "9sm5xK": { longURL: 'http://google.com', userID: 'user1'},
  "b6UTxQ": { longURL: 'http://www.tsn.ca', userID: 'user2'}
};

const usersDatabase = {
  'user1': {
    id: 'user1',
    email: 'user@example.com',
    hashedPassword: bcrypt.hashSync('purple-monkey-dinosaur', 10),
  },
  'user2': {
    id: 'user2',
    email: 'user2@example.com',
    hashedPassword: bcrypt.hashSync('dishwasher-funk', 10),
  }
};


app.get('/', (req, res) => {
  const user = usersDatabase[req.session.userID];
  if (user === undefined) {
    res.redirect('/login');
  } else {
    res.redirect('/urls');
  }
  
});

app.get('/401', (req, res) => {
  res.status(401).send('401: Please <a href ="/register">register</a> or <a href ="/login">login</a> to access your URLS');
});

//Show my urls
app.get('/urls', (req, res) => {
  const user = usersDatabase[req.session.userID];
  if (user === undefined) {
    res.redirect('/401');
  } else {
    const userURLS = dataFilter(urlDatabase, user['id'], 'userID');
    let templateVars = {
      urls: userURLS,
      user: user
    };
    res.render("urls_index", templateVars);
  }
});

//Generate a new short url / redirect to shortURL page
app.post("/urls", (req, res) => {
  let makeString = generateRandomString();
  urlDatabase[makeString] = { longURL: req.body['longURL'], userID: req.session.userID };
  res.redirect(`/urls/${makeString}`);
});

//Pass database to urls_show template w/ templateVars
app.get('/urls/:shortURL', (req, res) => {

  let { shortURL } = req.params;
  const user = usersDatabase[req.session.userID];
  
  if (shortURL in urlDatabase === false) {
    res.status(404).send('Error 404: That link is so small it doesn\'t exist');
  
  } else if (user === undefined) {
    res.redirect('/401');
  } else if (user.id !== urlDatabase[shortURL]["userID"]) {
    res.status(403).send('Error 403: Hey, that\'s not your link! Zelda might get upset if she catches you poking around in here.');
  } else {
    let templateVars = {
      shortURL: req.params.shortURL,
      longURL: urlDatabase,
      user: user
    };
    res.render("urls_show", templateVars);
  }
});


//Redirect users to the real website of short urls
app.get('/u/:shortURL', (req, res) => {
  let { shortURL } = req.params;
  if (shortURL in urlDatabase === false) {
    res.status(404).send('Error 404: Sorry, that link doesn\'t go anywhere... :(');
  } else {
    let redirectURL = urlDatabase[req.params.shortURL]['longURL'];
    res.redirect(redirectURL);
  }
});

//Delete url
app.post("/urls/:shortURL/delete", (req, res) => {
  let urlInJeopardy = urlDatabase[req.params.shortURL];
    
  if (urlInJeopardy['userID'] === req.session.userID) {
    delete urlDatabase[req.params.shortURL];
    res.redirect('/urls');
  } else {
    res.status(403).send('Error 403: Hey, that\'s not your link! Zelda might get upset if she catches you poking around in here.');
  }
});

//Edit url
app.post('/u/:shortURL/update', (req, res) => {
  let urlInJeopardy = urlDatabase[req.params.shortURL];
  if (urlInJeopardy['userID'] === req.session.userID) {
    const { newURL } = req.body;
    urlDatabase[req.params.shortURL] = { longURL: newURL, userID: req.session.userID };
  }
  res.redirect(`/urls`);
});


//Create new shorturl page
app.get('/urls/new', (req, res) => {
  const user = usersDatabase[req.session.userID];
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

  const user = usersDatabase[req.session.userID];
  if (user !== undefined) {
    res.redirect('/urls');
  
  } else {
    let templateVars = {
      user: user
    };
    res.render("register", templateVars);
  }
});

//submit registration, with async hashing and invalid request catches
app.post('/register', (req, res) => {

  let { email, password } = req.body;
  if (email === '' || password === '') {
    res.status(400);
    res.send('Invalid email or password entered. Please <a href ="/register">register</a> again');

  } else if (getUserByEmail(email, usersDatabase)) {
    res.status(400);
    res.send('Someone has already registered with that email. Please <a href="/login">login<a>, or <a href ="/register">register</a> with a different email');
  
  } else {
    let seed = generateRandomString();
    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(password, salt, (err, hash) => {
        usersDatabase[seed] = { email, hashedPassword: hash, id: seed};
        req.session.userID = seed;
        res.redirect('/urls');
      });
    });
  }
});


//Login page
app.get('/login', (req, res) => {
  const user = usersDatabase[req.session.userID];
  if (user !== undefined) {
    res.redirect('/urls');
  } else {
    let templateVars = {
      user: user
    };
    res.render('login', templateVars);
  }
});

//Login post req
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  let user = usersDatabase[getUserByEmail(email, usersDatabase)];
  
  if (user) {
    bcrypt.compare(password, user.hashedPassword, (err, result) => {
      if (result) {
        req.session.userID = user.id;
        res.redirect('/');
      } else {
        res.status(403).send('Error: 403 - Ew, I don\'t like that, not your email or password');
      }
    });

  } else {
    res.status(403).send('Sorry, I couldn\'t find that user');
  }
});

//End session
app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});