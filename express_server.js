var express = require("express");
var app = express();
var PORT = 8080; // default port 8080
var cookieSession = require('cookie-session')
//const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
app.use(bodyParser.urlencoded({extended: true}));
//app.use(cookieParser());
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']}))
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

function urlsForUser(userId) {
  const ulrsSpecificUser = {};
  for(var shortUrl in urlDatabase){
    if(urlDatabase[shortUrl].userID === userId) {
      ulrsSpecificUser[shortUrl] = urlDatabase[shortUrl];
    }
  }
  return ulrsSpecificUser;
}

const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" }
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
  if(urlDatabase[req.params.shortURL]) {
  res.redirect("https://" + urlDatabase[req.params.shortURL].longURL);
  }
  res.send("Invalid URL");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/list.json", (req, res) => {
  res.json(users);
});

app.get("/urls/new", (req, res) => {
  let templateVars = { user: users[req.session.user_id]};
  res.render("urls_new", templateVars);
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.get("/urls", (req, res) => {
  const templateVars = {
    users,
    user: users[req.session.user_id],
    urls: urlsForUser(req.session.user_id)
  };
  console.log(templateVars);
  if(users[req.session.user_id]){
    res.render("urls_index", templateVars);
  }else{
    res.redirect("/login")
  }
});

app.get("/urls/:id", (req, res) => {
  if(users[req.session.user_id].id !== urlDatabase[req.params.id].userID){
    res.redirect("/urls")
    return
  }
  let templateVars = {
    user: users[req.session.user_id],
    shortURL: req.params.id,
    longURL: urlDatabase[req.params.id].longURL
  };
  console.log(templateVars);
  res.render("urls_show", templateVars);
});

app.get("/hello", (req, res) => {
  let templateVars = { greeting: 'Hello World!', user: users[req.session.user_id]
 };
  res.render("hello_world", templateVars);
});

app.get("/register", (req, res) => {
  res.render("urls_reg");
});

app.post("/register", (req, res) => {
  const userId = generateRandomString(6);
  const email = req.body.email;
  const password = bcrypt.hashSync(req.body.password, 10);

  if( email === "" || password === ""){
    res.status(400).send("Please provide a valid email or password.");
  }
  const emailList = [];
  for (var key in users) {
    emailList.push(users[key].email);
  }

  if(emailList.includes(email)) {
    res.status(400).send("User already exist, please login.");
} else {  
  users[userId] = {id: userId, email: email, password: password};
  req.session.user_id = userId;
  res.redirect("/urls");}
});

app.post("/urls/:shortURL", (req, res) => {
  let short = req.params.shortURL;
  urlDatabase[short].longURL = req.body.longURL;
  res.redirect("/urls");
});

app.post("/urls", (req, res) => {
  let short = generateRandomString(6);
  let long = req.body.longURL;
  urlDatabase[short] = {longURL: long, userID: req.session.user_id};
  res.redirect("/urls");
});
app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
})

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  let userPasswordMatch = false;
  for (var key in users) {
    if (users[key].email === email && bcrypt.compareSync(password, users[key].password)) {
      userPasswordMatch = key
    }
  }
  if(userPasswordMatch){
      req.session.user_id = key;
      res.redirect("/urls");
  }else{
      res.status(400).send("Please provide a valid email or/and password.");
  }
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

