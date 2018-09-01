'use strict';
var multer = require('multer');
const Vendor = require('../models/Vendor');
const Driver = require('../models/Driver');
const Pickup = require('../models/PickUp');
const OrderStatus = require('../models/OrderStatus');
const GCM = require('../controllers/NotificationsController');
exports.vendorProfilePic = function(req, res) {

    var storage = multer.diskStorage({
        destination: function(req, file, cb) {
            cb(null, './uploads/vendors/profile/');
        },
        filename: function(req, file, cb) {

            cb(null, Date.now() + "_" + file.originalname)
        }

    });

    var upload = multer({
        storage: storage
    }).single('profile_pic');
    upload(req, res, function(err, result) {

        if (err) {
            return res.status(422).send({
                status: false,
                message: "Error in uploading Image",
                statusCode: 422,
                data: null
            });
        } else {


            let id = req.body.id || req.query.id;
            let profile_pic = '/uploads/vendors/profile/' + req.file.filename;
            Vendor.findOne({
                _id: id
            }, function(err, result) {
                if (err) {
                    return res.status(422).send({
                        status: false,
                        message: "Something got wrong:Invalid Id",
                        statusCode: 422,
                        data: null
                    });
                } else if (result) {
                    let reqData = new Object();
                    reqData.profile_pic = profile_pic;
                    reqData._id = id;
                    Vendor.findOneAndUpdate({
                        _id: id
                    }, reqData, {
                        new: true
                    }, function(err, vendor) {
                        if (err) {
                            return res.status(422).send({
                                status: false,
                                message: "Error in uploading Image",
                                statusCode: 422,
                                data: null
                            });
                        } else {
                            reqData._id = id;
                            return res.status(200).send({
                                status: true,
                                statusCode: 200,
                                message: "Image Uploaded Successfully",
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
    });
};


exports.driverProfilePicWeb = function(req, res) {

    var storage = multer.diskStorage({
        destination: function(req, file, cb) {
            cb(null, './uploads/drivers/profile/');
        },
        filename: function(req, file, cb) {

            cb(null, Date.now() + "_" + file.originalname)
        }

    });

    var upload = multer({
        storage: storage
    }).single('profile_pic');
    upload(req, res, function(err, result) {

        if (err) {
            return res.status(422).send({
                status: false,
                message: "Error in uploading Image",
                statusCode: 422,
                data: null
            });
        } else {


            let id = req.params.id;
            let profile_pic = '/uploads/drivers/profile/' + req.file.filename;
            Driver.findOne({
                _id: id
            }, function(err, result) {
                if (err) {
                    return res.status(422).send({
                        status: false,
                        message: "Something got wrong: invalid id",
                        statusCode: 422,
                        data: null
                    });
                } else if (result) {
                    let reqData = new Object();
                    reqData.profile_pic = profile_pic;
                    reqData._id = id;
                    Driver.findOneAndUpdate({
                        _id: id
                    }, reqData, {
                        new: true
                    }, function(err, driver) {
                        if (err) {
                            return res.status(422).send({
                                status: false,
                                message: "Error in uploading Image",
                                statusCode: 422,
                                data: null
                            });
                        } else {
                            reqData._id = id;
                            return res.status(200).send({
                                status: true,
                                statusCode: 200,
                                message: "Image Uploaded Successfully",
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

    });
};


exports.driverProfilePic = function(req, res) {
	
	   

    var storage = multer.diskStorage({
        destination: function(req, file, cb) {
            cb(null, './uploads/drivers/profile/');
        },
        filename: function(req, file, cb) {

            cb(null, Date.now() + "_" + file.originalname)
        }

    });

    var upload = multer({
        storage: storage
    }).single('profile_pic');
    upload(req, res, function(err, result) {

        if (err) {
			console.log(1);
            return res.status(422).send({
                status: false,
                message: "Error in uploading Image",
                statusCode: 422,
                data: null
            });
        } else {


            let id = req.body.id || req.query.id;
            let profile_pic = '/uploads/drivers/profile/' + req.file.filename;
            Driver.findOne({
                _id: id
            }, function(err, result) {
                if (err) {
					console.log(2);
                    return res.status(422).send({
                        status: false,
                        message: "Something got wrong: invalid id",
                        statusCode: 422,
                        data: null
                    });
                } else if (result) {
                    let reqData = new Object();
                    reqData.profile_pic = profile_pic;
                    reqData._id = id;
                    Driver.findOneAndUpdate({
                        _id: id
                    }, reqData, {
                        new: true
                    }, function(err, driver) {
                        if (err) {
							console.log(3);
                            return res.status(422).send({
                                status: false,
                                message: "Error in uploading Image",
                                statusCode: 422,
                                data: null
                            });
                        } else {
                            reqData._id = id;
                            return res.status(200).send({
                                status: true,
                                statusCode: 200,
                                message: "Image Uploaded Successfully",
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

    });
};

exports.drivingLicense = function(req, res) {

    var storage = multer.diskStorage({
        destination: function(req, file, cb) {
            cb(null, './uploads/drivers/documents/');
        },
        filename: function(req, file, cb) {

            cb(null, Date.now() + "_" + file.originalname)
        }

    });

    var upload = multer({
        storage: storage
    }).single('document');
    upload(req, res, function(err, result) {

        if (err) {
            return res.status(422).send({
                status: false,
                message: "Error in uploading Document",
                statusCode: 422,
                data: err
            });
        } else {


            let id = req.body.id || req.query.id;
            let driving_license = '/uploads/drivers/documents/' + req.file.filename;
            Driver.findOne({
                _id: id
            }, function(err, result) {
                if (err) {
                    return res.status(422).send({
                        status: false,
                        message: "Something got wrong",
                        statusCode: 422,
                        data: null
                    });
                } else if (result) {
                    let reqData = new Object();
                    reqData.driving_license = driving_license;
                    reqData._id = id;
                    Driver.findOneAndUpdate({
                        _id: id
                    }, reqData, {
                        new: true
                    }, function(err, driver) {
                        if (err) {
                            return res.status(422).send({
                                status: false,
                                message: "Error in uploading Document",
                                statusCode: 422,
                                data: err
                            });
                        } else {
                            reqData._id = id;
                            return res.status(200).send({
                                status: true,
                                statusCode: 200,
                                message: "Document Uploaded Successfully",
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

    });
};

exports.policeVerfication = function(req, res) {

    var storage = multer.diskStorage({
        destination: function(req, file, cb) {
            cb(null, './uploads/drivers/documents/');
        },
        filename: function(req, file, cb) {

            cb(null, Date.now() + "_" + file.originalname)
        }

    });

    var upload = multer({
        storage: storage
    }).single('document');
    upload(req, res, function(err, result) {

        if (err) {
            return res.status(422).send({
                status: false,
                message: "Error in uploading Document",
                statusCode: 422,
                data: err
            });
        } else {


            let id = req.body.id || req.query.id;
            let police_verfication = '/uploads/drivers/documents/' + req.file.filename;
            Driver.findOne({
                _id: id
            }, function(err, result) {
                if (err) {
                    return res.status(422).send({
                        status: false,
                        message: "Something got wrong",
                        statusCode: 422,
                        data: null
                    });
                } else if (result) {
                    let reqData = new Object();
                    reqData.police_verfication = police_verfication;
                    reqData._id = id;
                    Driver.findOneAndUpdate({
                        _id: id
                    }, reqData, {
                        new: true
                    }, function(err, driver) {
                        if (err) {
                            return res.status(422).send({
                                status: false,
                                message: "Error in uploading Document",
                                statusCode: 422,
                                data: err
                            });
                        } else {
                            reqData._id = id;
                            return res.status(200).send({
                                status: true,
                                statusCode: 200,
                                message: "Document Uploaded Successfully",
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
    });
};

exports.markCompleted = function(req, res) {

    var storage = multer.diskStorage({
        destination: function(req, file, cb) {
            cb(null, './uploads/pickup/documents/');
        },
        filename: function(req, file, cb) {

            cb(null, Date.now() + "_" + file.originalname)
        }

    });

    var upload = multer({
        storage: storage
    }).single('document');
    upload(req, res, function(err, result) {

        if (err) {
            return res.status(422).send({
                status: false,
                message: "Error in uploading Document",
                statusCode: 422,
                data: err
            });
        } else {

            let id = req.body.order_id;
			let status = req.body.status;
            let document = '/uploads/pickup/documents/' + req.file.filename;
            OrderStatus.findOne({
                _id: id
            }, function(err, result) {
                if (err) {
                    return res.status(422).send({
                        status: false,
                        message: "Something got wrong",
                        statusCode: 422,
                        data: null
                    });
                } else if (result) {
                    let reqData = new Object();
                    reqData.document = document;
					reqData.status = status;
                    reqData._id = id;
					
					if(status=='completed'){
						let end_time = new Date();
                        end_time = end_time.toISOString();
						reqData.end_time=end_time;
						
					}
					
                    OrderStatus.findOneAndUpdate({
                        _id: id
                    }, reqData, {
                        new: true
                    }, function(err, orderStatus) {
                        if (err) {
                            return res.status(422).send({
                                status: false,
                                message: "Error in uploading Document",
                                statusCode: 422,
                                data: err
                            });
                        } else {
							
							Driver.findOne({
                                _id: orderStatus.driver_id
                            }, function(err, driver) {

                                if (err) {
                                    return err;
                                }
								if(reqData.status=='intransit'){
									var ordersInHand = driver.orders_in_hand + 1;
								}else if(reqData.status=='completed'){
									if(driver.orders_in_hand>0){
									var ordersInHand = driver.orders_in_hand - 1;
									let pushObj = new Object();
									pushObj.orderInfo=orderStatus;
									pushObj.type='completed';
									
									GCM.notifyVendor("BagDKart", pushObj, orderStatus.vendor_id, "Your order has been delivered Successfully");
									Driver.findOneAndUpdate({
                                        _id: driver._id
                                    }, {
                                        orders_in_hand: ordersInHand
                                    }, {
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
										   reqData._id = id;
											return res.status(200).send({
												status: true,
												statusCode: 200,
												message: "Document Uploaded Successfully",
												data: reqData,
											});
										}


                                        });
									
									
									}else{
									    	return res.status(200).send({
												status: true,
												statusCode: 200,
												message: "Document Uploaded Successfully",
												data: reqData,
											});
										
									}
								   
							    }



                                                    
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
    });
};




exports.uploadPackageImages = function(req, res) {

    var storage = multer.diskStorage({
        destination: function(req, file, cb) {
            cb(null, './uploads/pickup/documents/');
        },
        filename: function(req, file, cb) {

            cb(null, Date.now() + "_" + file.originalname)
        }

    });

    var upload = multer({
        storage: storage
    }).single('document');
    upload(req, res, function(err, result) {

        if (err) {
            return res.status(422).send({
                status: false,
                message: "Error in uploading Document",
                statusCode: 422,
                data: err
            });
        } else {


            let id = req.body.pickup_id;
			let index = req.body.index;
            let package_images = '/uploads/pickup/documents/' + req.file.filename;
            Pickup.findOne({
                _id: id
            }, function(err, result) {
                if (err) {
                    return res.status(422).send({
                        status: false,
                        message: "Something got wrong",
                        statusCode: 422,
                        data: null
                    });
                } else if (result) {
                    let reqData = new Object();
					
					
					switch(index) {
						case '1':
							reqData.package_image1 = package_images;
							break;
						case '2':
							reqData.package_image2 = package_images;
							break;
						case '3':
							reqData.package_image3  = package_images;
							break;
					}
                    
                    reqData._id = id;
                    Pickup.findOneAndUpdate({
                        _id: id
                    }, reqData, {
                        new: true
                    }, function(err, pickup) {
                        if (err) {
                            return res.status(422).send({
                                status: false,
                                message: "Error in uploading Document",
                                statusCode: 422,
                                data: err
                            });
                        } else {
                            reqData._id = id;
                            return res.status(200).send({
                                status: true,
                                statusCode: 200,
                                message: "Document Uploaded Successfully",
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
    });
};

exports.registrationCert = function(req, res) {

    var storage = multer.diskStorage({
        destination: function(req, file, cb) {
            cb(null, './uploads/drivers/documents/');
        },
        filename: function(req, file, cb) {

            cb(null, Date.now() + "_" + file.originalname)
        }

    });

    var upload = multer({
        storage: storage
    }).single('document');
    upload(req, res, function(err, result) {

        if (err) {
            return res.status(422).send({
                status: false,
                message: "Error in uploading Document",
                statusCode: 422,
                data: err
            });
        } else {


            let id = req.body.id || req.query.id;
            let registration_cert = '/uploads/drivers/documents/' + req.file.filename;
            Driver.findOne({
                _id: id
            }, function(err, result) {
                if (err) {
                    return res.status(422).send({
                        status: false,
                        message: "Something got wrong",
                        statusCode: 422,
                        data: null
                    });
                } else if (result) {
                    let reqData = new Object();
                    reqData.registration_cert = registration_cert;
                    reqData._id = id;
                    Driver.findOneAndUpdate({
                        _id: id
                    }, reqData, {
                        new: true
                    }, function(err, driver) {
                        if (err) {
                            return res.status(422).send({
                                status: false,
                                message: "Error in uploading Document",
                                statusCode: 422,
                                data: err
                            });
                        } else {
                            reqData._id = id;
                            return res.status(200).send({
                                status: true,
                                statusCode: 200,
                                message: "Document Uploaded Successfully",
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
    });
};