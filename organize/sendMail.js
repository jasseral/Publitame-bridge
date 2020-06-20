// -------------- GENERAL IMPORTS ----------------
require('dotenv').config()
const sgMail = require('@sendgrid/mail');

const sendMail =(to,subject,text)=> {

  sgMail.setApiKey(process.env.SENDGRID_API_KEY)
  
  const msg = {
    to: to,
    from: {
      email : 'notification@publitame.co',
      name : 'Publitame'
    },
    subject: subject,
    text: text,
    html: text
  };

  


  // html: '<strong>You are on your way! Lets confirm your email address.</strong>'
  

  return sgMail.send(msg)
    

}

// subject: 'Welcome to publitame',
// text: 'You are on your way! Lets confirm your email address.',

exports.sendMail = sendMail;


