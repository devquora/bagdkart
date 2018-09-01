'use strict';

const cfenv = require('cfenv');
const appEnv = cfenv.getAppEnv();
const Driver = require('../models/Driver');
let createToken = require('../comman/createToken');
const OrderStatus = require('../models/OrderStatus');
const Location = require('../models/Location');

let bcrypt = require('bcrypt');
var Promise = require('promise');
var fs = require('fs');
var https = require('https');
if (!appEnv.isLocal) {
    var appDetails = appEnv.services["user-provided"][0].credentials;
    const accountSid = appDetails.accountSID;
    const authToken = appDetails.authToken;
    let twilio_details = require('twilio')(accountSid, authToken);
}


function generatePassword(pwd) {

    let hash = bcrypt.hashSync(pwd, 10);
    return hash;
};

function sendCode(ext,mobile_no,otp) {
    const accountSid = 'ACbb354c3ff933631cb9c76538c8c89605';
    const authToken = 'a4f9b6ae58037d48542799d758187abf';
    const client = require('twilio')(accountSid, authToken);
    console.log(ext+mobile_no);
    //console.log(process.env.TWILIO_PHONE_NUMBER);
	
   client.messages.create({
	  from: '+16303946236',
	  to:    ext+mobile_no,
	  body: "Your BagDart Otp is "+otp
	}, function(err, result) {
	  console.log('Created message using callback');
	 
	});
   
};

function fetchImage(url, localPath) {
   

 var fullUrl = url;
 
 
   var file = fs.createWriteStream(localPath);
	var request = https.get(url, function(response) {
		response.pipe(file);
	});

 
}

const twilio_message_service = (req, res, next) => {
    console.log(appDetails);
    twilio_details.message.list(function(err, data) {
        data.messages.forEach((message) => {
            console.log(message.body);
        });
    });
    res.status(200).send({
        message: 'values sent',
        data: appDetails
    });
};

exports.setPassword = function(req, res) {
    let id = req.body.id;
    let token = req.body.auth_token;
    let password = generatePassword(req.body.password);

    Driver.findOne({
        _id: id,
    }, function(err, result) {
        if (err) {
            res.status(422).send({
                status: false,
                message: "Something got wrong",
                statusCode: 422,
                data: null
            });
        } else {
            let driverJson = JSON.parse(JSON.stringify(result));
            if (result) {
                console.log(result);
                console.log(token);
                if (result.auth_token != token) {
                    return res.status(422).send({
                        status: false,
                        message: "Invalid Token",
                        statusCode: 422,
                        data: null
                    });

                }
                let reqData = new Object();
                reqData.password = password;
                reqData._id = id;
                Driver.findOneAndUpdate({
                    _id: id
                }, reqData, {
                    new: true
                }, function(err, driver) {
                    if (err) {
                        res.status(422).send({
                            status: false,
                            message: "Something got wrong",
                            statusCode: 422,
                            data: null
                        });
                    } else {
                        res.status(200).send({
                            status: true,
                            statusCode: 200,
                            message: "Password set succussfully",
                            data: reqData
                        });
                    }
                });


            } else {

                res.status(422).send({
                    status: false,
                    message: "Invalid user Id",
                    statusCode: 422,
                    data: null
                });
            }
        }
    });
}

exports.driverMobileVerification = function(req, res) {

    const accountSid = 'AC9b5d1f28b7d8ab851b393eebc75d962a';
    const authToken = 'f90283dddc38e4d126f50e141bd0ae3f';
    const twilio_details = require('twilio')(accountSid, authToken);

    twilio_details.messages.create({
        from: process.env.TWILIO_PHONE_NUMBER,
        to: '+917827099801',
        body: "You just sent an SMS from Node.js using Twilio!"
    }).then((message) => console.log(message.sid));

};


exports.driverResetPassword = function(req, res) {
    if (req.body.auth_type == 'email') {
        let email = req.body.email;

        Driver.findOne({
            email: email
        }, function(err, result) {

            let driverJson = JSON.parse(JSON.stringify(result));
            if (err) {
                return err;
            } else if (result) {
                res.status(200).send({
                    status: true,
                    statusCode: 200,
                    message: "Thanks! we have sent the password reset instructions on your registered Email.",
                    data: null,
                });

            } else {
                res.status(404).send({
                    status: false,
                    statusCode: 404,
                    message: "Email is not registered with us"

                });
            }
        });
    } else {
        res.status(422).send({
            status: false,
            statusCode: 422,
            message: "unauthorized access",
            data: null
        });
    }


};
exports.resetByMobile = function(req, res) {
    let otp = generateOTP();
    let mobile_no = req.body.mobile_no;

    Driver.findOne({
        mobile_no: mobile_no
    }, function(err, result) {
        if (err) {
            res.status(422).send({
                status: false,
                message: "Something got wrong",
                statusCode: 422,
                data: null
            });
        } else if (result) {
            let reqData = new Object();
            reqData.otp = otp;
			Driver.findOneAndUpdate({
                _id: result._id
            }, reqData, {
                new: true
            }, function(err, driver) {
                if (err) {
                    return res.status(422).send({
                        status: false,
                        message: "Error in generating Reset OTP",
                        statusCode: 422,
                        data: null
                    });
                } else {
                    reqData._id = result._id;
					    if(mobile_no!=0 && reqData.otp!=""){
							sendCode(driver.ext,mobile_no,reqData.otp)
						}
                    return res.status(200).send({
                        status: true,
                        statusCode: 200,
                        message: "Reset OTP Generated Successfully",
                        data: reqData,
                    });
                }
            });

        } else {
            res.status(422).send({
                status: false,
                message: "Mobile no is not registered with us",
                statusCode: 422,
                data: null
            });
        }

    });
	
	
}



exports.listDrivers = function(req, res) {
    Driver.find({}, function(err, driver) {
        if (err)
            res.send(err);
        res.json(driver);

    });
};

function generateOTP() {
    return Math.floor(1000 + Math.random() * 9000);
}

exports.resendOTP = function(req, res) {

    let otp = generateOTP();
    let id = req.body.id;

    Driver.findOne({
        _id: id
    }, function(err, result) {
        if (err) {
            res.status(422).send({
                status: false,
                message: "Something got wrong",
                statusCode: 422,
                data: null
            });
        } else if (result) {
            let reqData = new Object();
            reqData.otp = otp;
            Driver.findOneAndUpdate({
                _id: id
            }, reqData, {
                new: true
            }, function(err, driver) {
                if (err) {
                    return res.status(422).send({
                        status: false,
                        message: "Error in generating OTP",
                        statusCode: 422,
                        data: null
                    });
                } else {
                    reqData._id = id;
					if(driver.mobile_no!=0 && reqData.otp!=""){
							sendCode(driver.ext,driver.mobile_no,reqData.otp)
					}
                    return res.status(200).send({
                        status: true,
                        statusCode: 200,
                        message: "OTP Generated Successfully",
                        data: reqData,
                    });
                }
            });

        } else {
            return res.status(422).send({
                status: false,
                message: "Invalid Id: No records found",
                statusCode: 422,
                data: null
            });
        }

    });
}

exports.verifyOtp = function(req, res) {
    let id = req.body.id;
    let otp = req.body.otp;

    Driver.findOne({
        _id: id
    }, function(err, result) {
        if (err) {
            res.status(422).send({
                status: false,
                message: "Something got wrong",
                statusCode: 422,
                data: null
            });
        } else {
            let driverJson = JSON.parse(JSON.stringify(result));
            if (result) {

                if (driverJson.otp != otp) {
                    return res.status(422).send({
                        status: false,
                        statusCode: 422,
                        message: "Entered Otp is not valid",
                        data: null
                    });

                } else {
                    let token = createToken.createToken(driverJson.email + driverJson._id);
                    let reqData = new Object();
                    reqData.mobile_verified = 1;
					reqData.token=token;
                    Driver.findOneAndUpdate({
                        _id: id
                    }, reqData, {
                        new: true
                    }, function(err, driver) {
                        if (err) {
                            res.status(422).send({
                                status: false,
                                message: "Something got wrong",
                                statusCode: 422,
                                data: null
                            });
                        } else {
                            res.status(200).send({
                                status: true,
                                statusCode: 200,
                                message: "Your Mobile no. is verified successfully",
                                data: driver,
                            });
                        }
                    });

                }

            }else{
				res.status(422).send({
                                status: false,
                                message: "Something got wrong:Invalid Id",
                                statusCode: 422,
                                data: null
                            });
				
			}
        }
    });
}

exports.createDriver = function(req, res) {
    //console.log(req.body);
    let email = req.body.email;
    req.body.otp = generateOTP();
    let mobile_no = req.body.mobile_no;
	let ext = req.body.ext;
	req.body.emp_id='BagDKart-D-' + Math.random().toString(36).substr(2, 9);
    let new_driver = new Driver(req.body);
    if (mobile_no != undefined && mobile_no != "" && mobile_no != "") {
        Driver.findOne({
            mobile_no: mobile_no,
			ext: ext
        }, function(err, result) {
            if (result) {
                return res.status(422).send({
                    status: false,
                    message: "Mobile no already exists",
                    statusCode: 422,
                    data: null
                });
            } else {
                new_driver.save(function(err, driver) {
                    if (err) {
                        if (err.code == 11000) {
                            return res.status(422).send({
                                status: false,
                                message: "Email Id is already exists",
                                statusCode: 422,
                                data: null
                            });
                        } else {
                            return res.send(err);
                        }
                    } else {


                        return res.status(200).send({
                            status: true,
                            statusCode: 200,
                            message: "Registered successfully",
                            data: driver,
                        });
                    }

                });

            }
        });
    } else {
        new_driver.save(function(err, driver) {
            if (err) {
                if (err.code == 11000) {
                    return res.status(422).send({
                        status: false,
                        message: "Email Id is already exists",
                        statusCode: 422,
                        data: null
                    });
                } else {
                    return res.send(err);
                }
            } else {


                return res.status(200).send({
                    status: true,
                    statusCode: 200,
                    message: "Registered successfully",
                    data: driver,
                });
            }

        });
    }
};

exports.authenticateDriver = function(req, res) {
   // console.log(req.body);
    let gcm_id=req.body.gcm_id;
	let device_id=req.body.device_id;
   
	 if (req.body.auth_type == 'mobile') {
        let mobile_no = req.body.mobile_no,
            password = req.body.password;

        Driver.findOne({
            mobile_no: mobile_no
        }, function(err, result) {
            let driverJson = JSON.parse(JSON.stringify(result));
            if (err) {
                return err;
            } else if (result) {
				if(device_id==result.device_id){
				
                let validatePassword = result.comparePassword(password);
                if (!validatePassword) {
                    res.status(422).send({
                        status: false,
                        statusCode: 422,
                        message: "Password you have entered is not valid",
                        data: null,
                    });
                } else {
                    let token = createToken.createToken(driverJson.email + driverJson._id);
                    let id = driverJson._id;
                    let last_login = new Date();
                    last_login = last_login.toISOString();
                    driverJson.auth_token = token;
                    driverJson.last_login = last_login;
                    //updating token
                    let reqData = new Object();
                    reqData.auth_token = token;
                    reqData.last_login = last_login;
					reqData.gcm_id=gcm_id;
                    Driver.findOneAndUpdate({
                        _id: id
                    }, reqData, {
                        new: true
                    }, function(err, driver) {
                        if (err) {
                            res.status(422).send({
                                status: false,
                                message: "Something got wrong",
                                statusCode: 422,
                                data: null
                            });
                        } else {
                            res.status(200).send({
                                status: true,
                                statusCode: 200,
                                message: "Logged In successfully",
                                data: driver,
                            });
                        }

                    });


                }
            }else{
				
				res.status(422).send({
                    status: false,
                    statusCode: 422,
                    message: "Unauthorized Access.Device Id not matched",
                    data: null,
                });
			}
			}

			else {
                res.status(422).send({
                    status: false,
                    statusCode: 422,
                    message: "Mobile no you have entered is not registered.",
                    data: null,
                });
            }
        });
    } else if (req.body.auth_type == 'email') {
        let email = req.body.email,
            password = req.body.password;
        Driver.findOne({
            email: email
        }, function(err, result) {
            let driverJson = JSON.parse(JSON.stringify(result));
            if (err) {
                return err;
            } else if (result) {
				if(device_id==result.device_id){
                let validatePassword = result.comparePassword(password);
                if (!validatePassword) {
                    res.status(422).send({
                        status: false,
                        statusCode: 422,
                        message: "Password you have entered is not valid",
                        data: null,
                    });
                } else {
                    let token = createToken.createToken(driverJson.email + driverJson._id);
                    let id = driverJson._id;
                    let last_login = new Date();
                    last_login = last_login.toISOString();
                    driverJson.auth_token = token;
                    driverJson.last_login = last_login;
                    //updating token
                    let reqData = new Object();
                    reqData.auth_token = token;
                    reqData.last_login = last_login;
					reqData.gcm_id=gcm_id;
                    Driver.findOneAndUpdate({
                        _id: id
                    }, reqData, {
                        new: true
                    }, function(err, driver) {
                        if (err) {
                            res.status(422).send({
                                status: false,
                                message: "Something got wrong",
                                statusCode: 422,
                                data: null
                            });
                        } else {
                            res.status(200).send({
                                status: true,
                                statusCode: 200,
                                message: "Logged In successfully",
                                data: driver,
                            });
                        }

                    });


                }
				
            }else{
				
				res.status(422).send({
                    status: false,
                    statusCode: 422,
                    message: "Unauthorized Access.Device Id not matched",
                    data: null,
                });
			}
			} else {
                res.status(422).send({
                    status: false,
                    statusCode: 422,
                    message: "Email you have entered is not registered.",
                    data: null,
                });
            }
        });
    } else if (req.body.auth_type == "social") {
        let email = req.body.email;
        Driver.findOne({
            email: email
        }, function(err, result) {

            if (err) {
                return err;
            }
            if (!result) {
                let new_driver = new Driver(req.body);
                let token = createToken.createToken(new_driver.email);
                let last_login = new Date();
                new_driver.last_login = last_login.toISOString();
                new_driver.auth_token = token;
				new_driver.email_verified = 1;
				new_driver.gcm_id=gcm_id;
				new_driver.device=device;
				//new_driver.password="";
                new_driver.save(function(err, driver) {
                    if (err) {
                        if (err.code == 11000) {
                            return res.status(422).send({
                                status: false,
                                message: "Email Id is already exists",
                                statusCode: 422,
                                data: null
                            });
                        } else {
                            return res.send(err);
                        }
                    } else {
                        return res.status(200).send({
                            status: true,
                            statusCode: 200,
                            message: "Loggedin successfully",
                            data: driver,
                        });
                    }

                });

            } else {
if(device_id==result.device_id){
                let driverJson = JSON.parse(JSON.stringify(result));
                let token = createToken.createToken(driverJson.email + driverJson._id);
                let id = driverJson._id;
                let last_login = new Date();
                last_login = last_login.toISOString();
                driverJson.auth_token = token;
                driverJson.last_login = last_login;
				driverJson.email_verified=1;
				
                //updating token
                let reqData = new Object();
                reqData.auth_token = token;
                reqData.last_login = last_login;
				reqData.gcm_id=gcm_id;
				/*	
				if(req.body.profile_pic){
						let image_path='./uploads/vendors/profile/'+Date.now()+'.jpg';
						fetchImage(req.body.profile_pic,image_path);
					
					
					reqData.profile_pic = "";
				
				}*/
				if(req.body.first_name){
					reqData.first_name = req.body.first_name;
				}
				
				if(req.body.social){
					reqData.social = req.body.social;
				}
				if(req.body.device_id){
					reqData.device_id = req.body.device_id;
				}
				if(req.body.gcm_id){
					reqData.gcm_id = req.body.gcm_id;
				}
                Driver.findOneAndUpdate({
                    _id: id
                }, reqData, {
                    new: true
                }, function(err, driver) {
                    if (err) {
                        res.status(422).send({
                            status: false,
                            message: "Something got wrong",
                            statusCode: 422,
                            data: null
                        });
                    } else {
                        res.status(200).send({
                            status: true,
                            statusCode: 200,
                            message: "Logged In successfully",
                            data: driver,
                        });
                    }
                });
            }else{
				res.status(422).send({
                    status: false,
                    statusCode: 422,
                    message: "Unauthorized Access.Device Id not matched",
                    data: null,
                });
			}
			}
        });

    } else {
        res.status(422).send({
            status: false,
            statusCode: 422,
            message: "unauthorized access",
            data: null
        });
    }

};


exports.readDriver = function(req, res) {
    Driver.findById(req.params.id, function(err, driver) {
        if (err) {
            res.status(422).send({
                status: false,
                message: "Something got wrong",
                statusCode: 422,
                data: null
            });
        } else {
            res.status(200).send({
                status: true,
                statusCode: 200,
                message: "Success",
                data: driver,
            });
        }
    });
};


exports.updateDriver = function(req, res) {

	req.body.otp=generateOTP();
    Driver.findOneAndUpdate({
        _id: req.params.id
    }, req.body, {
        new: true
    }, function(err, driver) {
        if (err) {
            res.status(422).send({
                status: false,
                message: "Something got wrong",
                statusCode: 422,
                data: null
            });
        } else {
			if(driver==null){
				
				res.status(422).send({
                status: false,
                message: "invalid driver ",
                statusCode: 422,
                data: null
            });
			}
			if(driver.mobile_verified==0&& driver.mobile_no!=0){
				// send otp to verify no.
				   sendCode(driver.ext,driver.mobile_no,driver.otp);
				
					res.status(200).send({
						status: true,
						statusCode: 200,
						message: "Otp Sent Updated Successfully",
						data: driver,
					});
					
			}else{
			
            res.status(200).send({
                status: true,
                statusCode: 200,
                message: "Driver Updated Successfully",
                data: driver,
            });
			
			}
			

        }
    });
};

exports.listDriversOnMap = function(req, res) {
	let	responseObj =[];
	

	
	
	Driver.find({'status':'active'}, function(err, drivers) {
        if (err)
            res.send(err);
		
	let i=0;
	
var promises = drivers.map(function(driver) {
  return new Promise(function(resolve, reject) {
			let newResponse=new Object();
			newResponse.driver_name=driver.first_name+" "+driver.last_name;
			newResponse.driver_id  =driver._id;
			newResponse.profile_pic=driver.profile_pic;
			newResponse.driver_phone=driver.ext+" "+driver.mobile_no;
			newResponse.vendor_id="";
			newResponse.vendor_name="";
			newResponse.vendor_address="";
			newResponse.orders_inHand=driver.orders_in_hand;
			newResponse.location={};
		Location.findOne({
			driver_id: driver._id
		}, function(err, result) {	

		if(result){
			newResponse.location=result;
		}	
			OrderStatus.find({$and: [
			  {driver_id:driver._id},
			  { $or: [ 
			          {status:'started'},
					  {status:'new'},
					  {status: 'intransit'}
					  ,{status: 'arrived'}
					  ,{status: 'waiting'}
					  ,{status: 'package picked'}
					  ,{status: 'out of delivery'}
					 ] 
			}
			]}).populate('pickup_id').populate('vendor_id').sort({updated_at: -1}).exec(function(err, orders) {
			if (!err) {
						//newResponse.orders=orders;
						
						if(orders.length){
							
							if(orders[0].vendor_id){	
							    newResponse.vendor_id=orders[0].vendor_id._id;
								newResponse.vendor_name=orders[0].vendor_id.name;
								newResponse.vendor_address=orders[0].vendor_id.address_lane1;
							}
							if(orders[0].pickup_id){	
							    newResponse.pickup_id=orders[0].pickup_id._id;
								newResponse.start_loc=orders[0].pickup_id.start_loc;
								newResponse.end_loc=orders[0].pickup_id.end_loc;
							}
							
						}
				}
				resolve();
				responseObj[i]=newResponse;
			    i++;	
				
			  });
	  
	 });
	 });
});
	
Promise.all(promises)
.then(function() { 
		res.status(200).send({
				status: true,
				statusCode: 200,
				message: "Success",
				data: responseObj,
		});

 })
.catch(console.error);

		   
        


    });
};



exports.deleteDriver = function(req, res) {
    Driver.remove({
        '_id':req.params.id
    }, function(err, driver) {
        if (err) {
            res.send(err);
        } else {
            res.json({
                message: 'Driver successfully deleted'
            });
        }
    });
};