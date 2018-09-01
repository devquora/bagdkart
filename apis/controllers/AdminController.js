'use strict';
const cfenv = require('cfenv');
const appEnv = cfenv.getAppEnv();
const Admin = require('../models/Admin');
let createToken = require('../comman/createToken');
let bcrypt = require('bcrypt');
const sgMail = require('@sendgrid/mail');

var fs = require('fs');
var https = require('https');

sgMail.setApiKey("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");


exports.listUsers = function(req, res) {
    Admin.find({_id: { $ne: '5b1e24476425c22b44583600' }}, function(err, admin) {
        if (err)
            res.send(err);
        res.json(admin);
    });
};

exports.getDetails = function(req, res) {
    Admin.findById(req.params.id, function(err, admin) {
        if (err) {
            res.status(422).send({
                status: false,
                message: "Something got wrong",
                statusCode: 422,
                data: null
            });
        } else {
			if(admin!=null){
			   return res.status(200).send({
                    status: true,
                    statusCode: 200,
                    message: "Admin Details",
                    data: admin,
                });
							
			}else{
		   res.status(422).send({
                status: false,
                message: "Invalid admin Id",
                statusCode: 422,
                data: null
            });
			}
        }
    });
};
exports.updateAdmin = function(req, res) {
	
	let email= req.body.email;
	req.body.email=email.toLowerCase();
    
	Admin.findOneAndUpdate({
        _id: req.params.id
    }, req.body, {
        new: true
    }, function(err, admin) {

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
                message: "Admin Updated Successfully",
                data: admin,
            });
			
		
        }

    });
};

function generatePassword(pwd) {

    let hash = bcrypt.hashSync(pwd, 10);
    return hash;
};

exports.deleteAdmin = function(req, res) {
    Admin.remove({
       '_id':req.params.id
    }, function(err, vendor) {
        if (err) {
            res.status(422).send({
                status: true,
                statusCode: 200,
                message: "Error in deleting Record",
                data: "",
            });
        } else {
			
			
			Admin.find({_id: { $ne: '5b1e24476425c22b44583600' }}, function(err, admin) {
			if (err)
				res.send(err);
			
				res.status(200).send({
					status: true,
					statusCode: 200,
					message: "Record successfully deleted",
					data: admin,
				});
			});	
			

        }
    });
};

exports.sendResetEmail = function(req, res) {

    let email = req.body.email;

    Admin.findOne({
        email: email.toLowerCase()
    }, function(err, admin) {


        let adminJson = JSON.parse(JSON.stringify(admin));
        if (err) {

            return err;

        } else if (admin) {
			
				 let reset_token = Math.random().toString(36).slice(-12);	
				  Admin.findOneAndUpdate({
						_id: admin._id
					}, {'resetPasswordToken':reset_token}, {
						new: true
					}, function(err, admin) {

						if (err) {
							res.status(422).send({
								status: false,
								message: "Error in generating token",
								statusCode: 422,
								data: null
							});
						} else {
							
							
							const msg = {
								to: admin.email,
								from: 'admin@hewettsoftware.com',
								subject: 'Bagdkart Admin:Reset Password',
								text: 'Copy below link',
								html: '<b>Hi '+admin.first_name+',</b> <br/> You recently requested your password for Bagdart Admin. Kindly reset your password from below link. <br/> <strong>https://bagdkartadmin.mybluemix.net/#/reset-password/'+reset_token+'</strong>',
							};
							sgMail.send(msg);	
							    res.status(200).send({
									status: true,
									statusCode: 200,
									message: "We have sent the password reset instructions on your registered Email.",
									data: null,
								});						
						
						}

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

exports.resetPassword=function(req, res){
	
	Admin.findOne({
        resetPasswordToken: req.params.token
    }, function(err, result) {
        if (err) {
            res.status(422).send({
                status: false,
                message: "Something got wrong",
                statusCode: 422,
                data: null
            });
        } else if (result) {
            let password = generatePassword(req.body.password);
          
			Admin.findOneAndUpdate({
                _id: result._id
            }, {'password':password}, {
                new: true
            }, function(err, vendor) {
                if (err) {
                    return res.status(422).send({
                        status: false,
                        message: "Error in updating password",
                        statusCode: 422,
                        data: null
                    });
                } else {
                    return res.status(200).send({
                        status: true,
                        statusCode: 200,
                        message: "Password updated Successfully",
                        data: "",
                    });
                }
            });

        } else {
            res.status(422).send({
                status: false,
                message: "Link is expired ",
                statusCode: 422,
                data: null
            });
        }

    });
	
	
	
}
exports.create = function(req, res) {
    //console.log(req.body);
    let email = req.body.email;
    let mobile_no = req.body.mobile_no;
	let ext=req.body.ext;
	req.body.email=email.toLowerCase();
	req.body.password=generatePassword(req.body.first_name+"345");
    let new_admin = new Admin(req.body);

    new_admin.save(function(err, admin) {
            if (err) {
                if (err.code == 11000) {
                    return res.status(422).send({
                        status: false,
                        message: "Email Id Already in Use",
                        statusCode: 422,
                        data: null
                    });
                } else {
                    return res.send(err);
                }
            } else {
				
				
				    let reset_token = Math.random().toString(36).slice(-12);
				
				   
					Admin.findOneAndUpdate({
						_id: admin._id
					}, {'resetPasswordToken':reset_token}, {
						new: true
					}, function(err, admin) {

						if (err) {
							res.status(422).send({
								status: false,
								message: "Error in generating token",
								statusCode: 422,
								data: null
							});
						} else {
							
							const msg = {
								to: admin.email,
								from: 'admin@hewettsoftware.com',
								subject: 'Bagdkart Admin:Reset Password',
								text: 'Copy below link',
								html: 'Hi '+admin.first_name+', <br/> Your account has been created successfully. Kindly reset your password from below link. <br/> <strong>https://bagdkartadmin.mybluemix.net/#/reset-password/'+reset_token+'</strong>',
							};
							sgMail.send(msg);	
							  return res.status(200).send({
									status: true,
									statusCode: 200,
									message: "Record Created successfully",
									data: admin,
								});							
						
						}

					});
				
				
				
				

				

  

            }

        });
 };


exports.authenticate = function(req, res) {
   
   
   let email = req.body.email,
       password = req.body.password;
        Admin.findOne({
            email:email.toLowerCase() 
			
        }, function(err, result) {
            let adminJson = JSON.parse(JSON.stringify(result));
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
                }else {
                    let token = createToken.createToken(adminJson.email + adminJson._id);
                    let id = adminJson._id;
                    let last_login = new Date();
                    last_login = last_login.toISOString();
                    adminJson.auth_token = token;
                    adminJson.last_login = last_login;
                    //updating token
                    let reqData = new Object();
                    reqData.auth_token = token;
                    reqData.last_login = last_login;
					
                    Admin.findOneAndUpdate({
                        _id: id
                    }, reqData, {
                        new: true
                    }, function(err, admin) {
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
                                data: admin,
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

};