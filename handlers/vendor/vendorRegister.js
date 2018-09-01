// const mongoose = require('mongoose');
const vendorDetails = require('../../models/vendor/vendorDetails');
const cfenv = require('cfenv');
const appEnv = cfenv.getAppEnv();

if(!appEnv.isLocal) {
    var appDetails = appEnv.services["user-provided"][0].credentials;
	const accountSid = appDetails.accountSID;
    const authToken = appDetails.authToken;
    const twilio_details = require('twilio')(accountSid, authToken);
}



const registerValuesStandard = (req, res, next)=> {
    let vendorRegisterDetails = new vendorDetails.vendorData();

    vendorRegisterDetails.firstName = req.body.firstName;
    vendorRegisterDetails.lastName = req.body.lastName;
    vendorRegisterDetails.username = req.body.username;
    vendorRegisterDetails.password = req.body.password;
    vendorRegisterDetails.employeeId = req.body.employeeId;
    vendorRegisterDetails.phoneNumber = req.body.phoneNumber;
    vendorRegisterDetails.email = req.body.email;
    vendorRegisterDetails.businessName = req.body.businessName;
    vendorRegisterDetails.businessAddress = req.body.businessAddress;
    vendorRegisterDetails.subscription = req.body.subscription;
    vendorRegisterDetails.dateOfSubscriptionSigned = req.body.date;
    vendorRegisterDetails.device_id = req.body.device_id;
    vendorRegisterDetails.device_type = req.body.device_type;
    vendorRegisterDetails.firebase_key = req.body.firebase_key;
    vendorRegisterDetails.country_code = req.body.country_code;
    vendorRegisterDetails.role = req.body.role;

    vendorRegisterDetails.save()
    .then((data)=> {
        res.status(200).send({
            status: true,
            statusCode:200,
            list: [{value: `register successful`}]
        });
    }).catch((err)=> {
        console.log(err);
    })
};

const twilio_message_service = (req, res, next) => {
    console.log(appDetails);
    twilio_details.message.list(function(err, data) {
        data.messages.forEach((message)=> {
            console.log(message.body);
        });
    });
    res.status(200).send({
        message: 'values sent',
        data: appDetails
    });
};

//user-provided
module.exports = {
    registerValuesStandard,
    twilio_message_service
};