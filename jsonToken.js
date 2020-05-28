//arreglar los moldes de respuestas
// arreglar el login con valores de user y password decentes
// meterle el veneno codificacion salt y no se q vaina

const express = require('express')
var mongoose = require('mongoose')
var jwt = require('jsonwebtoken')


require('dotenv').config()
var app = express()
app.use(express.json())
app.use(express.urlencoded({extended: true}))

const conn = process.env.DB_STRING
const connection = mongoose.createConnection(conn, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})

const UserSchema = new mongoose.Schema({
    firstname : String,
    lastname : String,
    username: String, 
    hash: String,
    salt: String
})

// -------------- ALLOW CORS POLICY ----------------
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*"); 
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });


const User = connection.model('User', UserSchema)

// ARREGLAR LOS PUTOS CODIGOS DE RESPUESTA POR ALGO MAS RE PROOOO NO SEAS PEO 
// CAMBIAR ESTA VAINA A POST  
app.get('/token', (req, res) => {
    
    var username = 'jasser.garcia@gmail.com'
    User.findOne({ username: username })
    
    .then((user) => {
        if (!user) { res.status(401).send({error:username,detail:'User not found'}); }
      
        jwt.sign({
            exp: Math.floor(Date.now() / 1000) + (60 * 60), // one hour duration
            data: 'foobar'
        }
        , process.env.SECRET_TOKEN_PHRASE,
        function(err,token){
            if (err) { console.error(err) }
            res.send( `${token}`)      
        })
       
    })
    .catch((err) => {   
        console.error(err)
    })
    
})



app.get('/validate/:value', (req, res) => {
    try {
        var decoded = jwt.verify(req.params.value, process.env.SECRET_TOKEN_PHRASE);
        res.send(decoded.data) 
      } catch(err) {
        if (err) {res.status(401).send({error:err.message}); }
      }
    
})





app.listen(process.env.LOCAL_PORT_BRIDGE, function () {
    console.log(process.env.MESSAGE_ON_CONNECT_START)
})
