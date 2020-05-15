# bridge

app.use(fileUpload());

const fileUpload = require('express-fileupload');

app.post('/upload', function(req, res) {

  //OJO sera que uso directorio tmeporal ? 

    //Validacion cuando el archivo es 0 
    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).send('No files were uploaded.');
      }
    
      let sampleFile = req.files.sampleFile;
      //Nombre original 
      let sampleFileName = req.files.sampleFile.name;
      //OJO! debo autogenerar un id alterno para la identificacion del asset
      sampleFile.mv(`tmp/${sampleFileName}`, function(err) {
        if (err)
          return res.status(500).send(err);
    
        res.send('File uploaded!');
      });
  });

  app.post('/axios', function(req, res) {
      //console.log(req.body.dato)  
  });
