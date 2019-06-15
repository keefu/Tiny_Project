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
    keys: ['key1', 'key2']
}));
app.set("view engine", "ejs");

function generateRandomString(length) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}
//Construct a function to create new object
function urlsForUser(userId) {
    const ulrsSpecificUser = {};
    for (var shortUrl in urlDatabase) {
        if (urlDatabase[shortUrl].userID === userId) {
            ulrsSpecificUser[shortUrl] = urlDatabase[shortUrl];
        }
    }
    return ulrsSpecificUser;
}

const urlDatabase = {};

const users = {};

app.get("/", (req, res) => {
    res.redirect("/urls");
});

app.get("/u/:shortURL", (req, res) => {
    if (urlDatabase[req.params.shortURL]) {
        res.redirect("https://" + urlDatabase[req.params.shortURL].longURL);
    } else {
        res.send("Invalid URL");
    }
});

app.get("/urls.json", (req, res) => {
    res.json(urlDatabase);
});

app.get("/list.json", (req, res) => {
    res.json(users);
});

app.get("/urls/new", (req, res) => {
    if ( users[req.session.user_id]) {    
    let templateVars = {
        user: users[req.session.user_id]
    };
    res.render("urls_new", templateVars);
    } else { 
        return res
        .status(401)
        .send("You need to login first.")
    }
});

app.get("/login", (req, res) => {
    res.render("login");
});
//Set up user_id for further access 
app.get("/urls", (req, res) => {
    const templateVars = {
        user: users[req.session.user_id],
        urls: urlsForUser(req.session.user_id)
    };
    if (users[req.session.user_id]) {
        res.render("urls_index", templateVars);
    } else {
        res.redirect("/login")
    }
});
//Condition to having an user_id before continuing
app.get("/urls/:id", (req, res) => {
    if ( users[req.session.user_id] === undefined) {
        return res
            .status(401)
            .send("You need to login first.")
    }
    if (users[req.session.user_id].id !== urlDatabase[req.params.id].userID) {
        return res
            .status(401)
            .send("You need to login first.")
    }
    let templateVars = {
        user: users[req.session.user_id],
        shortURL: req.params.id,
        longURL: urlDatabase[req.params.id].longURL
    };
    res.render("urls_show", templateVars);
});
//Testing 
app.get("/hello", (req, res) => {
    let templateVars = {
        greeting: 'Hello World!',
        user: users[req.session.user_id]
    };
    res.render("hello_world", templateVars);
});

app.get("/register", (req, res) => {
    res.render("urls_reg");
});
//Registration page with multiple conditions as to having no empty password/email or to already existing email.
app.post("/register", (req, res) => {
    const userId = generateRandomString(6);
    const email = req.body.email;
    const password = bcrypt.hashSync(req.body.password, 10);

    if (email === "" || req.body.password === "") {
        return res
            .status(400)
            .send("Please provide a valid email or password.");
    }

    const emailList = [];
    for (var key in users) {
        emailList.push(users[key].email);
    }

    if (emailList.includes(email)) {
        return res
            .status(400)
            .send("User already exist, please login.");
    } else {
        users[userId] = {
            id: userId,
            email: email,
            password: password
        };
        req.session.user_id = userId;
        res.redirect("/urls");
    }
});

app.post("/urls/:shortURL", (req, res) => {
    let short = req.params.shortURL;
    urlDatabase[short].longURL = req.body.longURL;
    res.redirect("/urls");
});

app.post("/urls", (req, res) => {
    let short = generateRandomString(6);
    let long = req.body.longURL;
    urlDatabase[short] = {
        longURL: long,
        userID: req.session.user_id
    };
    res.redirect("/urls");
});

app.post("/urls/:shortURL/delete", (req, res) => {
    delete urlDatabase[req.params.shortURL];
    res.redirect("/urls");
});

app.post("/urls/:id/delete", (req, res) => {
    delete users[req.session.user_id].id;
    res.redirect("/urls");
});
//Login page with no empty entry and error message to no matching field.
app.post("/login", (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    let userPasswordMatch = false;
    for (var key in users) {
        if (users[key].email === email && bcrypt.compareSync(password, users[key].password)) {
            userPasswordMatch = key
        }
    }
    if (users[key].email === "" || password === "") {
        return res
            .status(400)
            .send("Please do not leave any field empty.")
    }
    if (userPasswordMatch) {
        req.session.user_id = key;
        res.redirect("/urls");
    } else {
        return res
            .status(400)
            .send("Please provide a valid email or/and password.");
    }
});

app.post("/logout", (req, res) => {
    req.session = null;
    res.redirect("/urls");
});

app.listen(PORT, () => {
    console.log(`Example app listening on port ${PORT}!`);
});
