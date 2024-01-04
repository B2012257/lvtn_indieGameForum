const jwt = require("jsonwebtoken")
require('dotenv').config()
let generateToken = (name, username) => {
    return jwt.sign(
        {
            //Payload
            name,
            username
        },
        process.env.ACCESS_TOKEN_SCKEY,
        {
            // Life Cycles of token
            expiresIn: '1d'
        }
    )
}
module.exports = {
    generateToken
}