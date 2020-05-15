const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const cookieSession = require('cookie-session');
const methodOverride = require('method-override');
const { getUserByEmail, generateRandomString, dataFilter } = require('./helpers');


const app = express();
const PORT = 8080;


app.set("view engine", "ejs");


app.use(cookieSession({
  name: 'tinyAppSession',
  secret: 'q4CfhXplA'
}));
app.use(bodyParser.urlencoded({extended: true}));
app.use(methodOverride('_method'));

const urlDatabase = {
};

const usersDatabase = {
};


app.get('/', (req, res) => {
  const user = usersDatabase[req.session.userID];
  if (user === undefined) {
    res.redirect('/login');
  } else {
    res.redirect('/urls');
  }
  
});

//Show users urls
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

//Generate a new short url then redirect to its page
app.post("/urls", (req, res) => {
  let makeString = generateRandomString();
  urlDatabase[makeString] = { longURL: req.body['longURL'], userID: req.session.userID };
  res.redirect(`/urls/${makeString}`);
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

//Display shortURL page with edit form, but only for the owner of that url
app.get('/urls/:shortURL', (req, res) => {

  let { shortURL } = req.params;
  const user = usersDatabase[req.session.userID];
  
  if (shortURL in urlDatabase === false) {
    res.redirect('/404');
  
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
    res.redirect('/404');
  } else {
    let redirectURL = urlDatabase[req.params.shortURL]['longURL'];
    res.redirect(redirectURL);
  }
});

//Delete url
app.delete("/urls/:shortURL", (req, res) => {
  let urlInJeopardy = urlDatabase[req.params.shortURL];
    
  if (urlInJeopardy['userID'] === req.session.userID) {
    delete urlDatabase[req.params.shortURL];
    res.redirect('/urls');
  } else {
    res.status(403).send('Error 403: Hey, that\'s not your link! Zelda might get upset if she catches you poking around in here.');
  }
});

//Edit url
app.put('/u/:shortURL', (req, res) => {
  let urlInJeopardy = urlDatabase[req.params.shortURL];
  if (urlInJeopardy['userID'] === req.session.userID) {
    const { newURL } = req.body;
    urlDatabase[req.params.shortURL] = { longURL: newURL, userID: req.session.userID };
  }
  res.redirect(`/urls`);
});

//Catch for trying to GET delete route
app.get("/urls/:shortURL/delete", (req, res) => {
  res.status(403).send('Error 403: Hey, that\'s not your link! Zelda might get upset if she catches you poking around in here.');
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
    res.status(400).send('Invalid email or password entered. Please <a href ="/register">register</a> again');

  } else if (getUserByEmail(email, usersDatabase)) {
    res.status(400).send('Someone has already registered with that email. Please <a href="/login">login<a>, or <a href ="/register">register</a> with a different email');
  
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

//Login
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  let user = usersDatabase[getUserByEmail(email, usersDatabase)];
  
  if (user) {
    bcrypt.compare(password, user.hashedPassword, (err, result) => {
      if (result) {
        req.session.userID = user.id;
        res.redirect('/');
      } else {
        res.redirect('/403');
      }
    });
  } else {
    res.redirect('/403');
  }
});

//Logout and end session
app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/urls');
});

//Not logged in redirect
app.get('/401', (req, res) => {
  res.status(401).send('401: Please <a href ="/register">register</a> or <a href ="/login">login</a> to access your URLS');
});

// Bad credentials redirect
app.get('/403', (req, res) => {
  res.status(403).send('Are you sure you have the right credentials? Please <a href="/login">Login</a> again');
});

//Page not found redirect
app.get('/404', (req, res) => {
  res.status(404).send('Error 404: That link is so small it doesn\'t exist');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});