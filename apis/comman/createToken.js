const jwt = require('jsonwebtoken'),
config = require('../../config'),
secretKey = config.secretKey;

const createToken = (user)=> {
    const token = jwt.sign({
        firstname: user.name,
        email: user.email,
        employeeId: user.emp_id
    }, secretKey);
    return token;
};

module.exports = {
    createToken
};