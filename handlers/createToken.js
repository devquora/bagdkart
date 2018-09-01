const jwt = require('jsonwebtoken'),
config = require('../config'),
secretKey = config.secretKey;

const createToken = (user)=> {
    const token = jwt.sign({
        firstname: user.firstName,
        email: user.email,
        employeeId: user.employeeId
    }, secretKey);
    return token;
};

module.exports = {
    createToken
};