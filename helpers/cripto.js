var crypto = require('crypto');

// -------------- HELPER FUNCTIONS ----------------
/**
 * @param {*} password - The plain text password
 * @param {*} hash - The hash stored in the database
 * @param {*} salt - The salt stored in the database
 */
const validPassword = (password, hash, salt) => {
    var hashVerify = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
    return hash === hashVerify;
}
/**
 * @param {*} password - The password string that the user inputs to the password field in the register form
 */
const genPassword = (password) => {
    var salt = crypto.randomBytes(32).toString('hex');
    var genHash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
    
    return {
      salt: salt,
      hash: genHash
    };
}

exports.genPassword = genPassword;
exports.validPassword = validPassword;