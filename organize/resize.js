var Jimp = require('jimp');
 


Jimp.read('imagen.jpg')
  .then(lenna => {
    return lenna
      .resize(960, 960) // resize
      .quality(60) // set JPEG quality
      //.greyscale() // set greyscale
      .write('lena-small-bw.jpg'); // save
  })
  .catch(err => {
    console.error(err);
  });