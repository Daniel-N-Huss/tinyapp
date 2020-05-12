const express = require('express');
const bodyParser = require('body-parser');
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

app.get('/urls/:shortURL', (req, res) => {
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase};
  res.render("urls_show", templateVars);
});

app.post("/urls", (req, res) => {
  let makeString = generateRandomString();
  urlDatabase[makeString] = req.body['longURL'];
  res.redirect(`/urls/${makeString}`);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});