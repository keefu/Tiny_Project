var express = require("express");
var app = express();
var PORT = 8080; // default port 8080

function generateRandomString(length) {
   var result = '';
   var characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
   var charactersLength = characters.length;
   for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
   }
   return result;
}

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

app.set("view engine", "ejs");

var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/", (req, res) => {
  res.send("Hello!");
});
app.get("/u/:shortURL", (req, res) => {
  res.redirect(urlDatabase[req.params.shortURL]);
});
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls", (req, res) => {
  const keys = Object.keys(urlDatabase);
  const templateVars = {
    urls: urlDatabase,
    keys: keys
  };
  console.log(templateVars);

  res.render("urls_index", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]};
console.log(req)
res.render("urls_show", templateVars);
});

app.get("/hello", (req, res) => {
  let templateVars = { greeting: 'Hello World!' };
  res.render("hello_world", templateVars);
});

app.post("/urls/:shortURL", (req, res) => {
  res.render("urls_index");
});

app.post("/urls", (req, res) => {
  let short = generateRandomString(6);
  let long = req.body.longURL;
  urlDatabase[short] = long;
  res.redirect("/urls");
});
app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});



