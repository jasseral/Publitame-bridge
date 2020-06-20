var mongoose = require('mongoose')

const conn = process.env.DB_STRING
const connection = mongoose.createConnection(conn, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})


const UserSchema = new mongoose.Schema({
    firstname : String,
    lastname : String,
    phone : String,
    username: String, 
    verified : Boolean,
    recoverykey : String,
    hash: String,
    salt: String,

})

exports.connection = connection
exports.UserSchema = UserSchema

