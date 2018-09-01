'use strict';
const cfenv = require('cfenv');
const appEnv = cfenv.getAppEnv();
const Vendor = require('../models/Vendor');
const Address = require('../models/Address');
let createToken = require('../comman/createToken');
let bcrypt = require('bcrypt');
const sgMail = require('@sendgrid/mail');

const Order = require('../models/OrderStatus');

var fs = require('fs');
var https = require('https');

sgMail.setApiKey("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");
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

function generateOTP() {
    return Math.floor(1000 + Math.random() * 9000);
}


exports.verifyOtp = function(req, res) {
    let id = req.body.id;
    let otp = req.body.otp;

    Vendor.findOne({
        _id: id
    }, function(err, result) {
        if (err) {
            res.status(422).send({
                status: false,
                message: "Something got wrong:Invalid Id",
                statusCode: 422,
                data: null
            });
        } else {
            let vendorJson = JSON.parse(JSON.stringify(result));
            if (result) {

                if (vendorJson.otp != otp) {
                    return res.status(422).send({
                        status: false,
                        message: "Entered Otp is not valid",
                        statusCode: 422,
                        data: null
                    });

                } else {

					let token = createToken.createToken(vendorJson.email + vendorJson._id);
                    let reqData = new Object();
                    reqData.mobile_verified = 1;
					reqData.token=token;
                    Vendor.findOneAndUpdate({
                        _id: id
                    }, reqData, {
                        new: true
                    }, function(err, vendor) {
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
                                data: vendor,
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



exports.sendMobileVerification = function(req, res) {
	//console.log(mobile_no);
   //console.log(otp);
   
    const accountSid = 'ACbb354c3ff933631cb9c76538c8c89605';
    const authToken = 'a4f9b6ae58037d48542799d758187abf';
    const client = require('twilio')(accountSid, authToken);
    /*   client.messages.create({
		  from: '+16303946236',
		  to: '+918010064868',
		  body: "Twilio!"
		}).then((message) => console.log(message.sid));
		*/
		
	client.messages.create({
	  from: '+16303946236',
	  to: '+918010064868',
	  body: 'create using callback'
	}, function(err, result) {
	  console.log('Created message using callback');
	  console.log(result.sid);
	});

 /*   let Obj = twilio_details.messages.create({
        from: '+16303946236',
        to: '+918010064868',
        body: "Your BagDart Otp is 2345"
    }).then((message) => function(message) {

            res.status(200).send({
                status: false,
                statusCode: 200,
                data: [{
                    value: message
                }]
            });
			 console.log(message.sid)
        });*/
	
	
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


exports.sendResetEmail = function(req, res) {

    let email = req.body.email;

    Vendor.findOne({
        email: email
    }, function(err, result) {


        let vendorJson = JSON.parse(JSON.stringify(result));
        if (err) {

            return err;

        } else if (result) {

            const msg = {
                to: email,
                from: 'info@hewettsoftware.com',
                subject: 'Bagdkart:Reset Password',
                text: 'Copy below link',
                html: '<strong>and easy to do anywhere, even with Node.js</strong>',
            };
            sgMail.send(msg);

            res.status(200).send({
                status: true,
                statusCode: 200,
                message: "Thanks! we have sent the password reset instructions on your registered Email.",
                data: null,
            });

        } else {
            res.status(422).send({
                status: false,
                statusCode: 422,
                message: "Email is not registered with us",
                data: null,
            });
        }
    });

};
exports.listVendors = function(req, res) {
    Vendor.find({}, function(err, vendor) {
        if (err)
            res.send(err);
        res.json(vendor);
    });
};


exports.listVendorsOnMap = function(req, res) {
    Vendor.find({'status':'active'}, function(err, vendor) {
        if (err)
            res.send(err);
			res.json(vendor);
    });
};
exports.listBusinesses = function(req, res) {
	let	responseObj =[];
/*	bussiness_name: { $ne: ""} 'status':'active'*/
    Vendor.find({'status':'active'}, function(err, vendors) {
        if (err)
            res.send(err);
        	let i=0;
		var promises = vendors.map(function(vendor) {
			return new Promise(function(resolve, reject) {
				let newResponse=new Object();
				newResponse.id=vendor._id;				
				newResponse.name  =vendor.bussiness_name+"("+vendor.name+")";
				newResponse.business_loc= vendor.business_loc;
				newResponse.address= vendor.address_lane1+" "+vendor.address_lane2+", "+vendor.city+", "+vendor.state+","+ vendor.zipcode;
				
				resolve();
				responseObj[i]=newResponse;
				i++;					
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


exports.createVendor = function(req, res) {
    //console.log(req.body);
    let email = req.body.email;
    let mobile_no = req.body.mobile_no;
	let ext=req.body.ext;
    req.body.otp = generateOTP();
	
	req.body.business_loc= { 
					 "type": "Point",
					 "coordinates": [parseFloat(req.body.business_lat),parseFloat(req.body.business_lng)]
				 };
    let new_vendor = new Vendor(req.body);

    if (mobile_no != undefined && mobile_no != "" && mobile_no != 0) {
        Vendor.findOne({
            mobile_no: mobile_no,
			ext:ext
        }, function(err, result) {
            if (result) {
                return res.status(422).send({
                    status: false,
                    message: "Mobile no already exists",
                    statusCode: 422,
                    data: null
                });

            } else {
                new_vendor.save(function(err, vendor) {
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
						if(vendor.mobile_no!=0 && vendor.otp!=""){
							sendCode(vendor.ext,vendor.mobile_no,vendor.otp);
						}
                        return res.status(200).send({
                            status: true,
                            statusCode: 200,
                            message: "Registered successfully",
                            data: vendor,
                        });

                    }

                });


            }
        });
    } else {
        new_vendor.save(function(err, vendor) {
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
                    data: vendor,
                });

            }

        });
    }
};

exports.setPassword = function(req, res) {
    let id = req.body.id;
    let token = req.body.auth_token;
    let password = generatePassword(req.body.password);

    Vendor.findOne({
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
            let vendorJson = JSON.parse(JSON.stringify(result));
            if (result) {
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
                Vendor.findOneAndUpdate({
                    _id: id
                }, reqData, {
                    new: true
                }, function(err, vendor) {
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

function fetchImage(url, localPath) {
   

 var fullUrl = url;
 
 
   var file = fs.createWriteStream(localPath);
	var request = https.get(url, function(response) {
		response.pipe(file);
	});

 
}
exports.authenticateVendor = function(req, res) {
    //console.log(req.body);
	    let gcm_id=req.body.gcm_id;
		let device_id=req.body.device_id;
		if (req.body.auth_type == 'mobile') {
        let mobile_no = req.body.mobile_no,
            password = req.body.password;
        Vendor.findOne({
            mobile_no: mobile_no
        }, function(err, result) {
            let vendorJson = JSON.parse(JSON.stringify(result));
            if (err) {

                return err;

            } else if (result) {
                let validatePassword = result.comparePassword(password);
                if (!validatePassword) {
                    res.status(422).send({
                        status: false,
                        statusCode: 422,
                        message: "Password you have entered is not valid",
                        data: null,
                    });
                } else {
                    let token = createToken.createToken(vendorJson.email + vendorJson._id);
                    let id = vendorJson._id;
                    let last_login = new Date();
                    last_login = last_login.toISOString();
                    vendorJson.auth_token = token;
                    vendorJson.last_login = last_login;
                    //updating token
                    let reqData = new Object();
                    reqData.auth_token = token;
                    reqData.last_login = last_login;
					
					reqData.gcm_id=gcm_id;
					reqData.device=device_id;
		 
                    Vendor.findOneAndUpdate({
                        _id: id
                    }, reqData, {
                        new: true
                    }, function(err, vendor) {
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
                                data: vendor,
                            });
                        }

                    });


                }
            } else {
                res.status(422).send({
                    status: false,
                    statusCode: 422,
                    message: "Mobile no you have entered is not registered.",
                    data: null,
                });
            }
        });
		}else if (req.body.auth_type == 'email') {
        let email = req.body.email,
            password = req.body.password;
        Vendor.findOne({
            email: email
        }, function(err, result) {
            let vendorJson = JSON.parse(JSON.stringify(result));
            if (err) {

                return err;

            } else if (result) {
                let validatePassword = result.comparePassword(password);
                if (!validatePassword) {
                    res.status(422).send({
                        status: false,
                        statusCode: 422,
                        message: "Password you have entered is not valid",
                        data: null,
                    });
                } else {
                    let token = createToken.createToken(vendorJson.email + vendorJson._id);
                    let id = vendorJson._id;
                    let last_login = new Date();
                    last_login = last_login.toISOString();
                    vendorJson.auth_token = token;
                    vendorJson.last_login = last_login;
                    //updating token
                    let reqData = new Object();
                    reqData.auth_token = token;
                    reqData.last_login = last_login;
					reqData.gcm_id=gcm_id;
					reqData.device=device_id;
                    Vendor.findOneAndUpdate({
                        _id: id
                    }, reqData, {
                        new: true
                    }, function(err, vendor) {
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
                                data: vendor,
                            });
                        }

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
        Vendor.findOne({
            email: email
        }, function(err, result) {

            if (err) {
                return err;
            } else if (!result) {
				
                let new_vendor = new Vendor(req.body);
                let token = createToken.createToken(new_vendor.email);
                let last_login = new Date();
                new_vendor.last_login = last_login.toISOString();
                new_vendor.auth_token = token;
				new_vendor.email_verified=1;
			//	new_vendor.password="";
                new_vendor.save(function(err, vendor) {
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
                            data: vendor,
                        });
                    }

                });

            } else {

                let vendorJson = JSON.parse(JSON.stringify(result));
                let token = createToken.createToken(vendorJson.email + vendorJson._id);
                let id = vendorJson._id;
                let last_login = new Date();
                last_login = last_login.toISOString();
                vendorJson.auth_token = token;
                vendorJson.last_login = last_login;
				
				
                //updating token
                let reqData = new Object();
                reqData.auth_token = token;
                reqData.last_login = last_login;
				reqData.email_verified=1;
				reqData.gcm_id=gcm_id;
				reqData.device=device_id;
				/*if(req.body.profile_pic){
					let image_path='./uploads/vendors/profile/'+Date.now()+'.jpg';
					fetchImage(req.body.profile_pic,image_path);
				
					
					reqData.profile_pic = "";
				}*/
				if(req.body.name){
					reqData.name = req.body.name;
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
				
                Vendor.findOneAndUpdate({
                    _id: id
                }, reqData, {
                    new: true
                }, function(err, vendor) {
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
                            data: vendor,
                        });
                    }

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

    Vendor.findOne({
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
			Vendor.findOneAndUpdate({
                _id: result._id
            }, reqData, {
                new: true
            }, function(err, vendor) {
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
							sendCode(vendor.ext,mobile_no,reqData.otp)
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

exports.resendOTP = function(req, res) {

    let otp = generateOTP();
    let id = req.body.id;

    Vendor.findOne({
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
            Vendor.findOneAndUpdate({
                _id: id
            }, reqData, {
                new: true
            }, function(err, vendor) {
                if (err) {
                    return res.status(422).send({
                        status: false,
                        message: "Error in generating OTP",
                        statusCode: 422,
                        data: null
                    });
                } else {
                    reqData._id = id;
					if(vendor.mobile_no!=0 && reqData.otp!=""){
							sendCode(vendor.ext,vendor.mobile_no,reqData.otp)
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
            res.status(422).send({
                status: false,
                message: "Invalid Id: No records found",
                statusCode: 422,
                data: null
            });
        }

    });
	
	
}
exports.readVendor = function(req, res) {
    Vendor.findById(req.params.id, function(err, vendor) {
        if (err) {
            res.status(422).send({
                status: false,
                message: "Something got wrong",
                statusCode: 422,
                data: null
            });
        } else {
			if(vendor!=null){
					Address.find({
								vendor_id:vendor._id 
							}, function(err, result) {
								if(result){
									
									let address=result;
									
										 res.status(200).send({
											status: true,
											statusCode: 200,
											message: "Success",
											address:address,
											data: vendor,
										});
								}else{
									let address=[];
										 res.status(200).send({
											status: true,
											statusCode: 200,
											message: "Success",
											address:address,
											data: vendor,
											
										});
								}
								
							});
							
			}else{
		   res.status(422).send({
                status: false,
                message: "Invalid Vendor Id",
                statusCode: 422,
                data: null
            });
			}
        }
    });
};


exports.updateVendor = function(req, res) {
	
	req.body.otp=generateOTP();
	req.body.business_loc= { 
					 "type": "Point",
					 "coordinates": [parseFloat(req.body.business_lat),parseFloat(req.body.business_lng)]
				 };
    Vendor.findOneAndUpdate({
        _id: req.params.id
    }, req.body, {
        new: true
    }, function(err, vendor) {

        if (err) {
            res.status(422).send({
                status: false,
                message: "Something got wrong",
                statusCode: 422,
                data: null
            });
        } else {
			if(vendor.mobile_verified==0&& vendor.mobile_no!=0){
				// send otp to verify no.
				   sendCode(vendor.ext,vendor.mobile_no,vendor.otp);
				
					res.status(200).send({
						status: true,
						statusCode: 200,
						message: "Otp Sent Updated Successfully",
						data: vendor,
					});
					
			}else{
			
            res.status(200).send({
                status: true,
                statusCode: 200,
                message: "Profile Updated Successfully",
                data: vendor,
            });
			
			}
        }

    });
};

exports.deleteVendorOrders =function(req, res) {

 Order.remove({
       'vendor_id':'5b6aa6d09365c0004c97ac24'
    }, function(err, vendor) {
        if (err) {
            res.send(err);
        } else {
            res.json({
                message: 'Vendor orders deleted successfully deleted'
            });
        }
    });

}




exports.deleteVendor = function(req, res) {


    Vendor.remove({
       '_id':req.params.id
    }, function(err, vendor) {
        if (err) {
            res.send(err);
        } else {
            res.json({
                message: 'Vendor successfully deleted'
            });
        }
    });
};