var express = require("express");
var app = express();
var PORT = 8080; // default port 8080
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.set("view engine", "ejs");

function generateRandomString(length) {
   var result = '';
   var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
   var charactersLength = characters.length;
   for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
   }
   return result;
}

var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
}

app.get("/", (req, res) => {
  res.send("Hello!");
});
app.get("/u/:shortURL", (req, res) => {
  res.redirect(urlDatabase[req.params.shortURL]);
});
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/list.json", (req, res) => {
  res.json(users);
});

app.get("/urls/new", (req, res) => {
  let templateVars = { user: users[req.cookies["user_id"]]};
  res.render("urls_new", templateVars);
});

app.get("/urls", (req, res) => {
  const keys = Object.keys(urlDatabase);
  const templateVars = {
    user: users[req.cookies["user_id"]],
    urls: urlDatabase,
    keys: keys
  };
  console.log(templateVars);
  res.render("urls_index", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
let templateVars = { user: users[req.cookies["user_id"]],
shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]};
console.log(templateVars);
res.render("urls_show", templateVars);
});

app.get("/hello", (req, res) => {
  let templateVars = { greeting: 'Hello World!', user: users[req.cookies["user_id"]]
 };
  res.render("hello_world", templateVars);
});

app.get("/register", (req, res) => {
  res.render("urls_reg");
});

app.post("/register", (req, res) => {
  const userId = generateRandomString(6);
  const email = req.body.email;
  const password = req.body.password;

  if( email === "" || password === ""){
    res.status(400).send("Please provide a valid email or password.");
  }
  const emailList = [];
  for (var key in users) {
    emailList.push(users[key].email);
  }
  console.log(emailList);

  if(emailList.includes(email)) {
    res.status(400).send("User already exist, please login.");
  }
  users[userId] = {id: userId, email: email, password: password};
  res.cookie('user_id', userId);
  console.log(users);
  console.log(emailList);
  res.redirect("/urls");
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

app.post("/login", (req, res) => {
  res.cookie('username', req.body.username);
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  res.clearCookie('user');
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

