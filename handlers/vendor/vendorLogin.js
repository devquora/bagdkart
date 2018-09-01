const vendorDetails = require('../../models/vendor/vendorDetails'),
createToken = require('../createToken');

const vendorLoginStandard = (req, res, next)=> {
    let username = req.body.username,
    password = req.body.password;
    console.log('standard login');

    vendorDetails.vendorData.findOne({
        username: username
    },function(err, result) {
        let vendorJson = JSON.parse(JSON.stringify(result));
        if(err) return err;
        if(result) {
            let validatePassword = result.comparePassword(password);
            if(!validatePassword) {
                console.log(`not a user`);
                res.status(400).send({
                    status: false,
                    statusCode: 400,
                    list: [{value: `enter correct password`}]
                });
            } else {
                let token = createToken.createToken(vendorJson);
                console.log(token);
                res.status(200).send({
					status: true,
                    statusCode:200,
					list: [{token, username: username}],
				});
            }
        } else {
            res.status(400).send({
                status: false,
                statusCode: 400,
                list: [{value: `enter correct username`}]
            });
        }
    });
};

module.exports = {
    vendorLoginStandard
};