require('dotenv').config()
var express = require('express');
var app = express();
var io = require('socket.io-client');
const fileUpload = require('express-fileupload');
const path = require('path')
const fs = require('fs')
var Jimp = require('jimp');




var socket = io.connect(process.env.EXT_SERVER_MANAGER, { 
  reconnection: true ,
  query: {'whois':'bridge'} });
  
  
  app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*"); 
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });
  
  
  app.use('/resources', express.static(__dirname + '/resources'));
  
  app.use(fileUpload());
  
  var bodyParser = require('body-parser');
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(bodyParser.json())
  
  socket.on('connect', function (socket) {
    console.log(process.env.MESSAGE_ON_CONNECT);
  });
  
  app.get('/sender',(req,res) => {       
    res.sendFile(path.join(__dirname,'/public/','/index.html'))
  })



  app.post('/interchange/', function (req, res) {
    
    
    switch (req.body.action) {
      case 'selected':
      var data = { action : req.body.action,buildingId : req.body.buildingId, boxId : req.body.boxId }
      socket.emit('bridgeToSocketServer',data)
      break;
      case 'purchaseBox':
      var data = { action : req.body.action,buildingId : req.body.buildingId, boxId : req.body.boxId }
      socket.emit('bridgeToSocketServer',data)
      break;
      case 'removePurchaseBox':
      var data = { action : req.body.action,buildingId : req.body.buildingId, boxId : req.body.boxId }
      socket.emit('bridgeToSocketServer',data)
      break;
      case 'addSimpleADS':
      var data = { action : req.body.action,buildingId : req.body.buildingId, boxId : req.body.boxId, title : req.body.title, message : req.body.message }
      socket.emit('bridgeToSocketServer',data)
      break;
      
      default:
      break;
    }
    
    console.log(`Routed message ${data.action} to server through of channel interchange`)
    res.send(`Routed message ${data.action} to server through of channel interchange`)
  })
  
  
  app.post('/upload', function(req, res) {
    
    //Mejorar todas las validaciones
    if(!req.body.action){
      res.send('No action defined')
      console.log('No action defined')
    }else{
      switch (req.body.action) {
      
        case 'addBoxImage':
        var data = { action : req.body.action, buildingId : req.body.buildingId, boxId : req.body.boxId, fileName : null }
        
        fs.existsSync(`resources/${data.buildingId}`) || fs.mkdirSync(`resources/${data.buildingId}`);
        if (!req.files || Object.keys(req.files).length === 0)  {return res.status(400).send('No files were uploaded.')}
        let file = req.files.imageBox;
        let fileName = `${data.buildingId}-${data.boxId}.jpg`
        
        data.fileName = `${data.buildingId}/${fileName}`
        
        file.mv(`resources/${data.buildingId}/${fileName}`, function(err) {
       
          if (err) {
            return res.status(500).send(err)
          }else{
  
            // Esta logica hace resize de la imagen entrante a 960x960
            // Se debe desacoplar esta logica de este modulo principal OJO!!
  
            Jimp.read(`resources/${data.buildingId}/${fileName}`)
              .then(lenna => {
                //Falta programar respuesta cuando falle la interaccion con el socket
                socket.emit('bridgeToSocketServer',data)
  
                return lenna
                  .resize(960, 960) // resize
                  .quality(60) // set JPEG quality
                  //.greyscale() // set greyscale
                  .write(`resources/${data.buildingId}/${fileName}`); // save
              })
              .catch(err => {
                console.error(err);
              });
  
        
            
          }
          
          res.send('File uploaded!');
          
        });
        break;
        
        case 'removeBoxImage':
        var data = { action : req.body.action,buildingId : req.body.buildingId,boxId : req.body.boxId }
        socket.emit('bridgeToSocketServer',data)
  
        res.send('File removed!');
  
        break;
        
        default:
        break;
      }
    }  

   


 

  })
  

  
  app.listen(process.env.LOCAL_PORT_BRIDGE, function () {
    console.log(process.env.MESSAGE_ON_CONNECT_START);
  });
  
  
  