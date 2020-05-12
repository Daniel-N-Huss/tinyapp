const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 8080;


app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));

const generateRandomString = function () {
  let seed = Math.random().toString(36);
  return seed.slice(2, 7);
};

const urlDatabase = {
  "b2xVn2": 'http://www.lighthouselabs.ca',
  "9sm5xK": 'http://google.com'
};

app.get('/', (req, res) => {
  res.send('Hello!');
});


app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get('/urls', (req, res) => {
  let templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get('/urls/new', (req, res) => {
  res.render('urls_new');
});

//Passes our database to the urls_show template
//we can see our database of short url's change dynamically.
app.get('/urls/:shortURL', (req, res) => {
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase};
  res.render("urls_show", templateVars);
});

//Generate a new short url, and key-value for database and redirectes user to a page for the short url
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

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect('/urls');
});

app.post('/u/:shortURL/update', (req, res) => {
  const { newURL } = req.body;
  urlDatabase[req.params.shortURL] = newURL;
  res.redirect(`/urls`);
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});