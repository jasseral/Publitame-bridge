const sgMail = require('@sendgrid/mail');

sgMail.setApiKey('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');
const msg = {
  to: 'jasser.garcia@gmail.com',
  from: 'publitame@gmail.com',
  subject: 'Welcome to publitame',
  text: 'You are on your way! Lets confirm your email address.',
  html: '<strong>You are on your way! Lets confirm your email address.</strong>'
};
//ES6
sgMail
  .send(msg)
  .then(() => {}, error => {
    console.error(error);

    if (error.response) {
      console.error(error.response.body)
    }
  });



