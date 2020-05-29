// -------------- GENERAL IMPORTS ----------------
require('dotenv').config()
var env =  process.env
const express = require('express')
const interface = require('./vendors/mongoose/interface')
const responseModel = require('./helpers/response')
const cripto = require('./helpers/cripto')
var app = express()
var jwt = require('jsonwebtoken')
// -------------- DATABASE INSTANCE ----------------
const User = interface.connection.model('User', interface.UserSchema)
// -------------- MIDDLEWARES ----------------
app.use(express.json())
app.use(express.urlencoded({extended: true}))
// -------------- ALLOW CORS POLICY ----------------
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*") 
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
  next()
})

// -------------- REGISTER USER ROUTE ----------------
app.post('/register', (req, res) => {
  
  //Validations
  // If the username in already taken
  User.findOne({ username: req.body.username })
  .then((user) => { 
    if(user){
      res.status(200)
      .send(responseModel('error',null,env.EMAIL_ALREADY_TAKEN)) 
    }else{
      // Register the new user
      var password = req.body.password
      const saltHash = cripto.genPassword(password)  
      const newUser = new User({
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        username: req.body.username,
        verified : false,
        hash: saltHash.hash,
        salt: saltHash.salt
      })
      newUser.save()
      .then((user) => {
        res.status(200)
        .send(responseModel('successful',null,env.USER_CREATED_SUCCESSFUL))
        
      }).catch(err=>{
        res.status(200)
        .send(responseModel('error',null,err.message))
      })
    }
  })
  
})

// -------------- GENERATE TOKEN ROUTE ----------------
app.post('/auth', (req, res) => {
  
  var username = req.body.username
  var password = req.body.password  
  
  User.findOne({ username: username })
  .then((user) => {
    // User validation
    if (!user) { 
      res
      .status(401)
      .send(responseModel('error',null,env.USER_NOT_FOUND_MESSAGE))}
      // Password validation 
      const isValid = cripto.validPassword(password, user.hash, user.salt);
      if (isValid) {
        jwt.sign({
          exp: Math.floor(Date.now() / 1000) + (60 * 60), 
          data: username
        },env.SECRET_TOKEN_PHRASE,
        function(err,token){
          if (err) { console.error(err) }
          //Inject values from User  
          var data = {
            token : token,
            username : user.username,
            firstname : user.firstname,
            lastname : user.lastname,
            verified : user.verified
          }
          res.status(200)
          .send(responseModel('successful',data,env.TOKEN_GENERATED_SUCCESSFUL))
        })
      } else {
        res
        .status(401)
        .send(responseModel('error',null,env.PASSWORD_NOT_MATCH_MESSAGE))
      }
      
    })
    //Find user catch
    .catch((err) => {   
      console.error(err)
    })
  })
  
  // -------------- VALIDATE TOKEN ROUTE ----------------
  app.post('/auth/validation', (req, res) => {
    var token = req.body.token
    try {
      var decoded = jwt.verify(token, env.SECRET_TOKEN_PHRASE)
      res.status(200)
      .send(responseModel(
        'successful',
        env.TOKEN_DECODED_SUCCESSFUL,
        decoded.data))
      } catch(err) {
        if (err) {
          res
          .status(401)
          .send(responseModel(
            'error',
            env.TOKEN_DECODED_ERROR,
            err.message))      
          }
        }
        
      })
      
      
   app.listen(env.LOCAL_PORT_BRIDGE,() => {
        console.log(env.MESSAGE_ON_CONNECT_START)
   })
      