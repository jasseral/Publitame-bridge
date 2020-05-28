const express = require('express');
const express = require('express');
const session = require('express-session');
var passport = require('passport');
var crypto = require('crypto');
var LocalStrategy = require('passport-local').Strategy;
const MongoStore = require('connect-mongo')(session);


 // -------------- GENERAL SETUP ----------------
require('dotenv').config();
var app = express();
app.use(express.json());
app.use(express.urlencoded({extended: true}));

// -------------- DATABASE ----------------
const conn = process.env.DB_STRING;
const connection = mongoose.createConnection(conn, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const UserSchema = new mongoose.Schema({
    firstname : String,
    lastname : String,
    username: String, // as email
    hash: String,
    salt: String
});

const User = connection.model('User', UserSchema);

// -------------- PASSPORT STRATEGY ----------------

passport.use(new LocalStrategy(
    function(username, password, cb) {
        User.findOne({ username: username })
            .then((user) => {
                if (!user) { return cb(null, false) }
                
                // Function defined at bottom of app.js
                const isValid = validPassword(password, user.hash, user.salt);
                
                if (isValid) {
                    return cb(null, user);
                } else {
                    return cb(null, false);
                }
            })
            .catch((err) => {   
                cb(err);
            });
}));
  
passport.serializeUser(function(user, cb) {
    cb(null, user.id);
});

passport.deserializeUser(function(id, cb) {
    User.findById(id, function (err, user) {
        if (err) { return cb(err); }
        cb(null, user);
    });
});


// -------------- SESSION SETUP ----------------
const sessionStore = new MongoStore({ mongooseConnection: connection, collection: 'sessions' })

app.use(session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    store: sessionStore,
    cookie: {
        // maxAge: 1000 * 30  this is 60 segundos
        maxAge: 24 * 60 * 60 * 1000
    }
}));

// -------------- PASSPORT AUTHENTICATION ----------------
 
app.use(passport.initialize());
app.use(passport.session());

// -------------- ALLOW CORS POLICY ----------------

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*"); 
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });


/**
 * -------------- ROUTES ----------------
 */
app.get('/', (req, res, next) => {
    res.send('<h1>Home</h1>');
});
// When you visit http://localhost:3000/login, you will see "Login Page"
app.get('/login', (req, res, next) => {
   
    const form = '<h1>Login Page</h1><form method="POST" action="/login">\
    Enter Username:<br><input type="text" name="username">\
    <br>Enter Password:<br><input type="password" name="password">\
    <br><br><input type="submit" value="Submit"></form>';
    res.send(form);
});
// Since we are using the passport.authenticate() method, we should be redirected no matter what 
app.post('/login',
  passport.authenticate('local'),
  function(req, res) {
        res.send('authorized!')  
    //res.redirect('/users/');
    //res.redirect('/users/' + req.user.username);
  });

  
// DELETE ME 
//When you visit http://localhost:3000/register, you will see "Register Page"
app.get('/register', (req, res, next) => {
    const form = '<h1>Register Page</h1><form method="post" action="register">\
                    Enter Username:<br><input type="text" name="username">\
                    <br>Enter Password:<br><input type="password" name="password">\
                    <br><br><input type="submit" value="Submit"></form>';
    res.send(form);
    
});

app.post('/register', (req, res, next) => {
    
    const saltHash = genPassword(req.body.password);
    
    const salt = saltHash.salt;
    const hash = saltHash.hash;
    const newUser = new User({
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        username: req.body.username,
        hash: hash,
        salt: salt
    });
    newUser.save()
        .then((user) => {
            console.log(user);
        });
 
    res.send('Successful')
});

// Visiting this route logs the user out
app.get('/logout', (req, res, next) => {
    req.logout();
    res.redirect('/login');
});
app.get('/login-success', (req, res, next) => {
    console.log(req.session);
    res.send('You successfully logged in.');
});

app.get('/users',(req,res) => {
    console.log(req.session);
    if (req.isAuthenticated()) {
        res.send(`<h1>${req.user.username} You are authenticated</h1>`);
    } else {
        res.send('<h1>You are not authenticated</h1>');
    }
})

/**
 * -------------- SERVER ----------------
 */
// Server listens on http://localhost:3000
  
app.listen(process.env.LOCAL_PORT_BRIDGE, function () {
    console.log(process.env.MESSAGE_ON_CONNECT_START);
  });


 // -------------- HELPER FUNCTIONS ----------------
 
/**
 * @param {*} password - The plain text password
 * @param {*} hash - The hash stored in the database
 * @param {*} salt - The salt stored in the database
 */
function validPassword(password, hash, salt) {
    var hashVerify = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
    return hash === hashVerify;
}
/**
 * @param {*} password - The password string that the user inputs to the password field in the register form
 */
function genPassword(password) {
    var salt = crypto.randomBytes(32).toString('hex');
    var genHash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
    
    return {
      salt: salt,
      hash: genHash
    };
}