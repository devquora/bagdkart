'use strict';
const Pickup = require('../models/PickUp');
const Location = require('../models/Location');
const Driver = require('../models/Driver');
const Vendor = require('../models/Vendor');
const OrderStatus = require('../models/OrderStatus');
const GCM = require('../controllers/NotificationsController');
var sleep = require('system-sleep');

exports.getStatus = function(req, res) {
    OrderStatus.findOne({
        _id: req.body.id
    }, function(err, result) {
        if (err) {
            res.status(422).send({
                status: false,
                message: "Something got wrong",
                statusCode: 422,
                data: err
            });
        } else {

            res.status(200).send({
                status: true,
                statusCode: 200,
                message: "Success",
                data: result,
            });


        }
    });

}


exports.setStatus = function(req, res) {
    let Dstatus = req.body.status;
    let last_login = new Date();
    last_login = last_login.toISOString();
    OrderStatus.findOne({
        _id: req.body.id
    }, function(err, result) {
        if (err) {
            res.status(422).send({
                status: false,
                message: "Something got wrong",
                statusCode: 422,
                data: err
            });
        } else {
            if (result) {
                if (result.status == 'request_timeout') {
                    res.status(422).send({
                        status: false,
                        message: "Request timeout",
                        statusCode: 422,
                        data: null
                    });

                }
				let updateOBJ={'status': Dstatus,'updated_at': last_login };
				
				if(Dstatus=='intransit'){
					
					 let start_time = new Date();
                        start_time = start_time.toISOString();
						updateOBJ={'status': Dstatus,'updated_at': last_login,'start_time':start_time };

				}
				
                OrderStatus.findOneAndUpdate({
                    _id: result._id
                },updateOBJ, {
                    upsert: true
                }, function(err, order) {
                    if (err) {
                        res.status(422).send({
                            status: false,
                            message: "Something got wrong",
                            statusCode: 422,
                            data: null
                        });
                    } else {

                        order.status = Dstatus;
                        res.status(200).send({
                            status: true,
                            statusCode: 200,
                            message: "Success",
                            data: order,
                        });
                    }
                });
            } else {
                res.status(422).send({
                    status: false,
                    message: "Invalid Order Id",
                    statusCode: 422,
                    data: null
                });

            }
        } // orderstatus

    }); // orderstatus

}


exports.updatePickupInfo = function(req, res) {
    let current_time = new Date();
    current_time = current_time.toISOString();
    let package_type = req.body.package_type;
    let customer_name = req.body.customer_name;
    let customer_mobile = req.body.customer_mobile;
    let customer_address = req.body.customer_address;
    let delivery_type = req.body.delivery_type;

    let updateObj = {
        'package_type': package_type,
        'customer_name': customer_name,
        'customer_mobile': customer_mobile,
        'customer_address': customer_address,
        'delivery_type': delivery_type,
        'updated_at': current_time,
        "end_loc": {
            "type": "Point",
            "coordinates": [parseFloat(req.body.end_lat), parseFloat(req.body.end_long)]
        },

    }

    Pickup.findOne({
        _id: req.body.pickup_id
    }, function(err, result) {
        if (err) {
            res.status(422).send({
                status: false,
                message: "Something got wrong",
                statusCode: 422,
                data: err
            });
        } else {
            if (result) {
                Pickup.findOneAndUpdate({
                    _id: result._id
                }, updateObj, {
                    upsert: true
                }, function(err, Pickup) {
                    if (err) {
                        res.status(422).send({
                            status: false,
                            message: "Something got wrong",
                            statusCode: 422,
                            data: err
                        });
                    } else {

                        res.status(200).send({
                            status: true,
                            statusCode: 200,
                            message: "Success",
                            data: updateObj,
                        });

                    }

                });
            } else {
                res.status(422).send({
                    status: false,
                    message: "Invalid Pickup Id",
                    statusCode: 422,
                    data: null
                });

            }
        }

    });

}



exports.cancelRequest = function(req, res) {
    // next nearby 
    let updateObj = new Object();
    updateObj.reason = req.body.reason;
    updateObj.message = req.body.message;
    updateObj.status = 'cancelled';
    updateObj.actioned_by = req.body.actioned_by;
    OrderStatus.findOneAndUpdate({
        _id: req.body.id
    }, updateObj, {
        new: true
    }, function(err, orderStatus) {

        if (orderStatus) {
			
            if (err) {
                res.status(422).send({
                    status: false,
                    message: "Something got wrong",
                    statusCode: 422,
                    data: null
                });
            } else if (req.body.actioned_by != 'vendor') {
                // status updated Successfully
                Pickup.findOne({
                    _id: orderStatus.pickup_id
                }, function(err, pickup) {

                    if (err) {
                        res.status(422).send({
                            status: false,
                            message: "Something got wrong",
                            statusCode: 422,
                            data: null
                        });
                    } else {

                                                Driver.findOne({
                                                    _id: orderStatus.driver_id
                                                }, function(err, driver) {

                                                    if (err) {
                                                        return err;
                                                    }
													
                                                    if (driver.orders_in_hand > 0) {
														 let ordersInHand=0;
                                                         ordersInHand = driver.orders_in_hand - 1;
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
                                                        }else{
															
									let pushObj = new Object();
                                    pushObj.vendor_id = orderStatus.vendor_id;
                                    pushObj.driver_id = orderStatus.driver_id;
                                    pushObj.pickup_id = orderStatus.pickup_id;
                                    pushObj.pickupInfo = pickup;
									pushObj.type='cancel';
                                    pushObj.driverInfo = {
                                        "name": driver.first_name + " "+driver.last_name,
                                        "mobile_no": driver.mobile_no,
                                        "ext": driver.ext                                       
                                    };
															
															
															GCM.notifyVendor("BagDKart", pushObj, pushObj.vendor_id, "Pickup is cancelled by Driver");
															
															res.status(200).send({
																status: true,
																message: "Order Cancelled Successfully",
																statusCode: 200,
																data: null
															});
															
														}

                                                    });
														 
														 
                                                    }else{
														
														res.status(422).send({
																status: true,
																message: "Order Cancelled  Already !!",
																statusCode: 422,
																data: null
															});
														
													}



                                                });

						
						

                    }


                });

            } else {



                Driver.findById(orderStatus.driver_id, function(err, driver) {

                    if (driver != null) {

                        Pickup.findOne({
                            _id: orderStatus.pickup_id
                        }, function(err, pickup) {

                            Vendor.findById(orderStatus.vendor_id, function(err, vendor) {
                                if (vendor != null) {
                                               Driver.findOne({
                                                    _id: orderStatus.driver_id
                                                }, function(err, driver) {

                                                    if (err) {
                                                        return err;
                                                    }
													
                                                    if (driver.orders_in_hand > 0) {
														 let ordersInHand=0;
                                                         ordersInHand = driver.orders_in_hand - 1;
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
                                                        }else{
															

                                    //pickup
                                    let pushObj = new Object();
                                    pushObj.vendor_id = orderStatus.vendor_id;
                                    pushObj.driver_id = orderStatus.driver_id;
                                    pushObj.pickup_id = orderStatus.pickup_id;
                                    pushObj.pickupInfo = pickup;
									pushObj.type='cancel';
                                    pushObj.vendorInfo = {
                                        "name": vendor.name,
                                        "mobile_no": vendor.mobile_no,
                                        "ext": vendor.ext,
                                        'bussiness_name': vendor.bussiness_name,
                                        'business_loc': vendor.business_loc
                                    };
									GCM.notifyVendor("BagDKart", pushObj, pushObj.driver_id, "Pickup is cancelled by Vendor");
															
															res.status(200).send({
																status: true,
																message: "Order Cancelled Successfully",
																statusCode: 200,
																data: null
															});
															
														}

                                                    });
														 
														 
                                                    }else{
														
														res.status(422).send({
																status: true,
																message: "Order Cancelled  Already !!",
																statusCode: 422,
																data: null
															});
														
													}



                                                });

                                }
                            });
                        });

                    } else {
                        // driver is deleted	

                    }
                });

            }
        } else {

            return res.status(200).send({
                status: false,
                message: "Invalid Pick up Id",
                statusCode: 200,
                data: null
            });
        }

    });

}

exports.acceptRequest = function(req, res) {

    // vendor detail notification


}

function loopUntillaccepted(req, res, pickup) {
    let cancelledDrivers = [];
    let i = 0;
    OrderStatus.find({
        pickup_id: pickup._id,
        status: 'cancelled'
    }, function(err, Orders) {
        var promises = Orders.map(function(cancelledOrders) {
            return new Promise(function(resolve, reject) {
                resolve();
                cancelledDrivers[i] = cancelledOrders.driver_id;
                i++;
            });
        });

        Promise.all(promises)
            .then(function() {
                let Lat = parseFloat(req.body.start_lat);
                let Long = parseFloat(req.body.start_long);

                let now = new Date();

                let query = {
                    "loc": {
                        $near: {
                            $geometry: {
                                type: "Point",
                                coordinates: [Lat, Long]
                            },
                            $maxDistance: 32000,
                            $minDistance: 0

                        }
                    },
                    status: "active",
                    driver_id: {
                        $ne: null
                    },
                    driver_id: {
                        $nin: cancelledDrivers
                    },
                    updated_at: { // 5 minutes ago (from now)
                        $gt: new Date(now.getTime() - 1000 * 60 * 50)
                    }
                }
                Location.findOne(query).populate({
                    path: 'driver_id',
                    match: {
                        $or: [{
                            orders_in_hand: null
                        }, {
                            orders_in_hand: {
                                $lt: 3
                            }
                        }],
                        status: 'active'
                    }
                }).exec(function(err, locationInfo) {
                    if (err) {

                        return res.status(422).send({
                            status: false,
                            message: "Unable to complete request",
                            statusCode: 422,
                            data: err
                        });

                    }
                    if (locationInfo) {
                        let orderObj = new Object();
                        orderObj.driver_id = locationInfo.driver_id._id;
                        orderObj.vendor_id = pickup.vendor_id;
                        orderObj.pickup_id = pickup._id;
                        let current_time = new Date();
                        orderObj.created_at = current_time.toISOString();
                        orderObj.updated_at = current_time.toISOString();
                        orderObj.status = 'new';
                        let newOrderStatus = new OrderStatus(orderObj);
                        newOrderStatus.save(function(err, order) {
                            if (err) {
                                return res.status(422).send({
                                    status: false,
                                    message: "Error in Updating Pickup Status",
                                    statusCode: 422,
                                    data: err
                                });

                            }
                            let status = 'new';

                            Driver.findOne({
                                _id: orderObj.driver_id
                            }, function(err, driver) {

                                if (err) {
                                    return err;
                                }

                                var ordersInHand = driver.orders_in_hand + 1;

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
                                    }
                                });

                            });


                            Vendor.findById(order.vendor_id, function(err, vendor) {
                                if (vendor != null) {

                                    let pushObj = new Object();
                                    let responseObj = new Object();
                                    responseObj.vendor_id = pushObj.vendor_id = order.vendor_id;
                                    responseObj.driver_id = pushObj.driver_id = order.driver_id;
                                    responseObj.pickup_id = pushObj.pickup_id = order.pickup_id;
                                    responseObj.order_id = pushObj.order_id = order._id;
                                    responseObj.pickupInfo = pushObj.pickupInfo = pickup;
                                    responseObj.vendorInfo = {
                                        "name": vendor.name,
                                        "mobile_no": vendor.mobile_no,
                                        "ext": vendor.ext,
                                        'profile_pic': vendor.profile_pic,
                                        'bussiness_name': vendor.bussiness_name,
                                        'business_loc': vendor.business_loc
                                    };
                                    responseObj.driverInfo = {
                                        "name": locationInfo.driver_id.first_name,
                                        "mobile_no": locationInfo.driver_id.mobile_no,
                                        "ext": locationInfo.driver_id.ext,
                                        'profile_pic': locationInfo.driver_id.profile_pic

                                    };
                                    pushObj.vendorInfo = {
                                        "name": vendor.name,
                                        "mobile_no": vendor.mobile_no,
                                        "ext": vendor.ext,
                                        'profile_pic': vendor.profile_pic,
                                        'bussiness_name': vendor.bussiness_name,
                                        'business_loc': vendor.business_loc
                                    };
									pushObj.type='new';
                                    GCM.notifyDriver("BagDKart", pushObj, locationInfo.driver_id._id, "New Pick Up request");
                                    var i = 0;
                                    console.log(order._id);
                                    var interval = setInterval(function() {
                                        OrderStatus.findById(order._id, function(err, checkOrder) {
                                            status = checkOrder.status;
         if (i > 20) {
                                                                                            let updateObj = new Object();
                                                                                            updateObj.reason = "Request Timeout";
                                                                                            updateObj.message = "";
                                                                                            updateObj.status = 'request_timeout';
                                                                                            updateObj.actioned_by = 'server';
																							
                                                                                            OrderStatus.findOneAndUpdate({
                                                                                                _id: order._id
                                                                                            }, updateObj, {
                                                                                                new: true
                                                                                            }, function(err, orderinfo) {
																							Driver.findOne({
                                                                                                _id: orderinfo.driver_id
                                                                                            }, function(err, driver) {

                                                                                                if (err) {
                                                                                                    return err;
                                                                                                }
																								let ordersInHand=0;
                                                                                                if (driver.orders_in_hand > 0){
                                                                                                     ordersInHand = driver.orders_in_hand - 1;
																									
																									
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
                                                                                                        process.exit();

                                                                                                    }else{
																										console.log("remaining orders"+ordersInHand);
																										 clearInterval(interval);
                                                                                                         resolve();
																									}

                                                                                                });
                                                                                                }else{
																									 clearInterval(interval);
                                                                                                      resolve();
																									
																								}


                                                                                            });

                                                                                            });

                                                                                           

                                                                                        }
                                            if (status == 'accepted') {
                                                /*return res.status(200).send();*/
                                                res.writeHead(200, {
                                                    "Content-Type": "application/json"
                                                });
                                                res.end(JSON.stringify({
                                                    status: true,
                                                    statusCode: 200,
                                                    message: "Pickup saved successfully",
                                                    data: responseObj,
                                                }));
                                                clearInterval(interval);

                                            } else if (status == 'cancelled') {
                                                clearInterval(interval);
                                                Driver.findOne({
                                                    _id: orderObj.driver_id
                                                }, function(err, driver) {

                                                    if (err) {
                                                        return err;
                                                    }
													let ordersInHand=0;
                                                    if (driver.orders_in_hand > 0) {
                                                        ordersInHand = driver.orders_in_hand - 1;
                                                    }

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
                                                        }

                                                    });

                                                });


                                                loopUntillaccepted(req, res, pickup);



                                            }
                                        });
                                        i++;

                                    }, 3000);




                                } else {
                                    return res.status(422).send({
                                        status: false,
                                        message: "Invalid vendor",
                                        statusCode: 422,
                                        data: null
                                    });

                                }
                            });




                        });

                    } else {
                        return res.status(200).send({
                            status: true,
                            statusCode: 200,
                            message: "No Drivers Available for Pickup",
                            data: null,
                        });

                    }


                });
            });
    });


}

function checkStatus(order) {
    var status;

    OrderStatus.findById(order._id, function(err, checkOrder) {
        status = checkOrder.status;
    });
    return status;

}

function f1() {
    true;
}


exports.create = function(req, res) {

        let future_date = new Date();
        future_date = future_date.toISOString();
        if (req.body.future_date) {
            future_date = new Date(req.body.future_date);
            future_date = future_date.toISOString();
        }
        var loc = {
            "vendor_id": req.body.vendor_id,
            "start_loc": {
                "type": "Point",
                "coordinates": [parseFloat(req.body.start_lat), parseFloat(req.body.start_long)]
            },
            "end_loc": {
                "type": "Point",
                "coordinates": [parseFloat(req.body.end_lat), parseFloat(req.body.end_long)]
            },
            "pick_type": req.body.pick_type,
            "request_type": req.body.request_type,
            "coupan_id": req.body.coupan_id,
            "package_type": req.body.package_type,
            "delivery_type": req.body.delivery_type,
            "customer_name": req.body.customer_name,
            "customer_mobile": req.body.customer_mobile,
            "customer_address": req.body.customer_address,
            "instructions": req.body.instructions,
            "amt": req.body.amt ? parseFloat(req.body.amt) : 0,
            "cash_collect": req.body.cash_collect ? parseFloat(req.body.cash_collect) : 0,
            "payment_type": req.body.payment_type,
            "future_date": future_date,

        }
        let new_pickup = new Pickup(loc);

        new_pickup.save(function(err, pickup) {
                    if (err) {

                        return res.status(422).send({
                            status: false,
                            message: "Error in Saving Pickup",
                            statusCode: 422,
                            data: err
                        });

                    } else {

                        let globalResponse = new Object();
                        let actioned = 1;
                        let Lat = parseFloat(req.body.start_lat);
                        let Long = parseFloat(req.body.start_long);

                        let now = new Date();
                        let query = {
                            "loc": {
                                $near: {
                                    $geometry: {
                                        type: "Point",
                                        coordinates: [Lat, Long]
                                    },
                                    $maxDistance: 32000,
                                    $minDistance: 0

                                }
                            },
                            status: "active",
                            driver_id: {
                                $ne: null
                            },
                            updated_at: { // 5 minutes ago (from now)
                                $gt: new Date(now.getTime() - 1000 * 60 * 50)
                            }
                        }
                        Location.find(query).populate({
                            path: 'driver_id',
                            match: {
                                $or: [{
                                    orders_in_hand: 0
                                }, {
                                    orders_in_hand: {
                                        $lt: 3
                                    }
                                }],
                                status: 'active'
                            }
                        }).sort({
                            loc: 1
                        }).exec(function(err, locations) {

                            if (err) {
                                return res.status(422).send({
                                    status: false,
                                    message: "Unable to complete request",
                                    statusCode: 422,
                                    data: err
                                });

                            } else {
								
                                if (!locations[0]) {
                                    return res.status(200).send({
                                        status: true,
                                        statusCode: 200,
                                        message: "No Drivers Available for Pickup",
                                        data: null,
                                    });

                                }
                                let booked = 0;
                                let refinedLocations = [];
                                let k = 0;
                                var promises1 = locations.map(function(locationInfoOBJ) {
                                    return new Promise(function(resolve, reject) {

                                        if (locationInfoOBJ.driver_id != null) {
                                            refinedLocations[k] = locationInfoOBJ;
                                            k++;
                                        }
                                        resolve();
                                    });
                                });
                          let locationInfo = new Object();

  
                          if (!refinedLocations[0]) {
                                    return res.status(200).send({
                                        status: true,
                                        statusCode: 200,
                                        message: "No Drivers Available for Pickup",
                                        data: null,
                                    });

                                }else{
                                Promise.all(promises1)
                                    .then(function() {
                                        if (refinedLocations[0]&& booked==0) {
                                            var promise2 = new Promise(function(resolve, reject) {
                                                if (booked == 1) {
                                                    resolve();
                                                }
                                                locationInfo = refinedLocations[0];
                                                if (locationInfo.driver_id == null) {
                                                    resolve();
                                                }

                                                let orderObj = new Object();
                                                orderObj.driver_id = locationInfo.driver_id._id;
                                                orderObj.vendor_id = pickup.vendor_id;
                                                orderObj.pickup_id = pickup._id;
                                                let current_time = new Date();
                                                orderObj.created_at = current_time.toISOString();
                                                orderObj.updated_at = current_time.toISOString();
                                                orderObj.status = 'new';
                                                let newOrderStatus = new OrderStatus(orderObj);
                                                newOrderStatus.save(function(err, order) {
                                                    if (err) {
                                                        return res.status(422).send({
                                                            status: false,
                                                            message: "Error in creating order",
                                                            statusCode: 422,
                                                            data: err
                                                        });

                                                    }
                                                    let status = 'new';


                                                    Driver.findOne({
                                                        _id: orderObj.driver_id
                                                    }, function(err, driver) {

                                                        if (err) {
                                                            return err;
                                                        }

                                                        var ordersInHand = driver.orders_in_hand + 1;

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
                                                            }
                                                        });

                                                    });

                                                    Vendor.findById(order.vendor_id, function(err, vendor) {
                                                        if (vendor != null) {
                                                            let pushObj = new Object();
                                                            let responseObj = new Object();
                                                            responseObj.vendor_id = pushObj.vendor_id = order.vendor_id;
                                                            responseObj.driver_id = pushObj.driver_id = order.driver_id;
                                                            responseObj.pickup_id = pushObj.pickup_id = order.pickup_id;
                                                            responseObj.order_id = pushObj.order_id = order._id;
                                                            responseObj.pickupInfo = pushObj.pickupInfo = pickup;
                                                            responseObj.vendorInfo = {
                                                                "name": vendor.name,
                                                                "mobile_no": vendor.mobile_no,
                                                                "ext": vendor.ext,
                                                                'profile_pic': vendor.profile_pic,
                                                                'bussiness_name': vendor.bussiness_name,
                                                                'business_loc': vendor.business_loc
                                                            };
                                                            responseObj.driverInfo = {
                                                                "name": locationInfo.driver_id.first_name,
                                                                "mobile_no": locationInfo.driver_id.mobile_no,
                                                                "ext": locationInfo.driver_id.ext,
                                                                'profile_pic': locationInfo.driver_id.profile_pic

                                                            };
                                                            pushObj.vendorInfo = {
                                                                "name": vendor.name,
                                                                "mobile_no": vendor.mobile_no,
                                                                "ext": vendor.ext,
                                                                'profile_pic': vendor.profile_pic,
                                                                'bussiness_name': vendor.bussiness_name,
                                                                'business_loc': vendor.business_loc
                                                            };
															pushObj.type='new';
                                                            GCM.notifyDriver("BagDKart", pushObj, locationInfo.driver_id._id, "New Pick Up request");

                                                            var i = 0;
                                                            var interval = setInterval(function() {
                                                                console.log(i);
                                                                OrderStatus.findById(order._id, function(err, checkOrder) {
                                                                    status = checkOrder.status;
                                                                    if (i > 30) {
                                                                                            let updateObj = new Object();
                                                                                            updateObj.reason = "Request Timeout";
                                                                                            updateObj.message = "";
                                                                                            updateObj.status = 'request_timeout';
                                                                                            updateObj.actioned_by = 'server';
																							
                                                                                            OrderStatus.findOneAndUpdate({
                                                                                                _id: order._id
                                                                                            }, updateObj, {
                                                                                                new: true
                                                                                            }, function(err, orderinfo) {
																							Driver.findOne({
                                                                                                _id: orderinfo.driver_id
                                                                                            }, function(err, driver) {

                                                                                                if (err) {
                                                                                                    return err;
                                                                                                }
																								let ordersInHand=0;
                                                                                                if (driver.orders_in_hand > 0){
                                                                                                     ordersInHand = driver.orders_in_hand - 1;
																									
																									
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
                                                                                                        process.exit();

                                                                                                    }else{
																										console.log("remaining orders"+ordersInHand);
																										 clearInterval(interval);
                                                                                                         resolve();
																									}

                                                                                                });
                                                                                                }else{
																									 clearInterval(interval);
                                                                                                      resolve();
																									
																								}


                                                                                            });

                                                                                            });

                                                                                           

                                                                                        }

                                                                    if (status == 'accepted') {

                                                                        booked = 1;
                                                                        globalResponse = responseObj;
                                                                        clearInterval(interval);
                                                                        resolve();

                                                                    } else if (status == 'cancelled') {
                                                                        clearInterval(interval);
                                                                        Driver.findOne({
                                                                            _id: orderObj.driver_id
                                                                        }, function(err, driver) {

                                                                            if (err) {
                                                                                return err;
                                                                            }
																			let ordersInHand=0;
                                                                            if (driver.orders_in_hand > 0) {
                                                                                 ordersInHand = driver.orders_in_hand - 1;
                                                                            
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

                                                                                }

                                                                            });
																			}

                                                                        });
                                                                        resolve();
                                                                    }
                                                                });
                                                                i++;

                                                            }, 1000);


                                                        } else {

                                                            return res.status(422).send({
                                                                status: false,
                                                                message: "Invalid vendor",
                                                                statusCode: 422,
                                                                data: null
                                                            });


                                                        }
                                                    });
                                                });
                                            });
                                            Promise.all([promise2])
                                                .then(function() {
                                                    if (refinedLocations[1] && booked==0) {
                                                        var promise3 = new Promise(function(resolve, reject) {
                                                            if (booked == 1) {
                                                                resolve();
                                                            }
                                                            locationInfo = refinedLocations[1];
                                                            if (locationInfo.driver_id == null) {
                                                                resolve();
                                                            }

                                                            let orderObj = new Object();
                                                            orderObj.driver_id = locationInfo.driver_id._id;
                                                            console.log(locationInfo.driver_id._id);
                                                            orderObj.vendor_id = pickup.vendor_id;
                                                            orderObj.pickup_id = pickup._id;
                                                            let current_time = new Date();
                                                            orderObj.created_at = current_time.toISOString();
                                                            orderObj.updated_at = current_time.toISOString();
                                                            orderObj.status = 'new';
                                                            let newOrderStatus = new OrderStatus(orderObj);
                                                            newOrderStatus.save(function(err, order) {
                                                                if (err) {
                                                                    return res.status(422).send({
                                                                        status: false,
                                                                        message: "Error in creating order",
                                                                        statusCode: 422,
                                                                        data: err
                                                                    });

                                                                }
                                                                let status = 'new';


                                                                Driver.findOne({
                                                                    _id: orderObj.driver_id
                                                                }, function(err, driver) {

                                                                    if (err) {
                                                                        return err;
                                                                    }

                                                                    var ordersInHand = driver.orders_in_hand + 1;

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
                                                                        }
                                                                    });

                                                                });

                                                                Vendor.findById(order.vendor_id, function(err, vendor) {
                                                                    if (vendor != null) {
                                                                        let pushObj = new Object();
                                                                        let responseObj = new Object();
                                                                        responseObj.vendor_id = pushObj.vendor_id = order.vendor_id;
                                                                        responseObj.driver_id = pushObj.driver_id = order.driver_id;
                                                                        responseObj.pickup_id = pushObj.pickup_id = order.pickup_id;
                                                                        responseObj.order_id = pushObj.order_id = order._id;
                                                                        responseObj.pickupInfo = pushObj.pickupInfo = pickup;
                                                                        responseObj.vendorInfo = {
                                                                            "name": vendor.name,
                                                                            "mobile_no": vendor.mobile_no,
                                                                            "ext": vendor.ext,
                                                                            'profile_pic': vendor.profile_pic,
                                                                            'bussiness_name': vendor.bussiness_name,
                                                                            'business_loc': vendor.business_loc
                                                                        };
                                                                        responseObj.driverInfo = {
                                                                            "name": locationInfo.driver_id.first_name,
                                                                            "mobile_no": locationInfo.driver_id.mobile_no,
                                                                            "ext": locationInfo.driver_id.ext,
                                                                            'profile_pic': locationInfo.driver_id.profile_pic

                                                                        };
                                                                        pushObj.vendorInfo = {
                                                                            "name": vendor.name,
                                                                            "mobile_no": vendor.mobile_no,
                                                                            "ext": vendor.ext,
                                                                            'profile_pic': vendor.profile_pic,
                                                                            'bussiness_name': vendor.bussiness_name,
                                                                            'business_loc': vendor.business_loc
                                                                        };
																		pushObj.type='new';
                                                                        GCM.notifyDriver("BagDKart", pushObj, locationInfo.driver_id._id, "New Pick Up request");

                                                                        var i = 0;
                                                                        var interval = setInterval(function() {
                                                                            console.log(i);
                                                                            OrderStatus.findById(order._id, function(err, checkOrder) {
                                                                                status = checkOrder.status;
																				if (i > 30) {
                                                                                            let updateObj = new Object();
                                                                                            updateObj.reason = "Request Timeout";
                                                                                            updateObj.message = "";
                                                                                            updateObj.status = 'request_timeout';
                                                                                            updateObj.actioned_by = 'server';
																							
                                                                                            OrderStatus.findOneAndUpdate({
                                                                                                _id: order._id
                                                                                            }, updateObj, {
                                                                                                new: true
                                                                                            }, function(err, orderinfo) {
																							Driver.findOne({
                                                                                                _id: orderinfo.driver_id
                                                                                            }, function(err, driver) {

                                                                                                if (err) {
                                                                                                    return err;
                                                                                                }
																								let ordersInHand=0;
                                                                                                if (driver.orders_in_hand > 0){
                                                                                                     ordersInHand = driver.orders_in_hand - 1;
																									
																									
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
                                                                                                        process.exit();

                                                                                                    }else{
																										console.log("remaining orders"+ordersInHand);
																										 clearInterval(interval);
                                                                                                         resolve();
																									}

                                                                                                });
                                                                                                }else{
																									 clearInterval(interval);
                                                                                                      resolve();
																									
																								}


                                                                                            });

                                                                                            });

                                                                                           

                                                                                        }

                                                                                if (status == 'accepted') {

                                                                                    booked = 1;
                                                                                    globalResponse = responseObj;
                                                                                    clearInterval(interval);
                                                                                    resolve();

                                                                                } else if (status == 'cancelled') {
                                                                                    clearInterval(interval);
                                                                                    Driver.findOne({
                                                                                        _id: orderObj.driver_id
                                                                                    }, function(err, driver) {

                                                                                        if (err) {
                                                                                            return err;
                                                                                        }
																						let ordersInHand=0;
                                                                                        if (driver.orders_in_hand > 0) {
                                                                                             ordersInHand = driver.orders_in_hand - 1;
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
                                                                                                process.exit();

                                                                                            }

                                                                                        });
																						}

                                                                                    });
                                                                                    resolve();
                                                                                }
                                                                            });
                                                                            i++;

                                                                        }, 1000);


                                                                    } else {

                                                                        return res.status(422).send({
                                                                            status: false,
                                                                            message: "Invalid vendor",
                                                                            statusCode: 422,
                                                                            data: null
                                                                        });
                                                                        process.exit();

                                                                    }
                                                                });
                                                            });
                                                        });

                                                        Promise.all([promise3]).then(function() {
                                                            if (refinedLocations[2] && booked==0) {
                                                                var promise4 = new Promise(function(resolve, reject) {
                                                                    if (booked == 1) {
                                                                        resolve();
                                                                    }
                                                                    locationInfo = refinedLocations[2];
                                                                    if (locationInfo.driver_id == null) {
                                                                        resolve();
                                                                    }

                                                                    let orderObj = new Object();
                                                                    orderObj.driver_id = locationInfo.driver_id._id;
                                                                    console.log(locationInfo.driver_id._id);
                                                                    orderObj.vendor_id = pickup.vendor_id;
                                                                    orderObj.pickup_id = pickup._id;
                                                                    let current_time = new Date();
                                                                    orderObj.created_at = current_time.toISOString();
                                                                    orderObj.updated_at = current_time.toISOString();
                                                                    orderObj.status = 'new';
                                                                    let newOrderStatus = new OrderStatus(orderObj);
                                                                    newOrderStatus.save(function(err, order) {
                                                                        if (err) {
                                                                            return res.status(422).send({
                                                                                status: false,
                                                                                message: "Error in creating order",
                                                                                statusCode: 422,
                                                                                data: err
                                                                            });

                                                                        }
                                                                        let status = 'new';


                                                                        Driver.findOne({
                                                                            _id: orderObj.driver_id
                                                                        }, function(err, driver) {

                                                                            if (err) {
                                                                                return err;
                                                                            }

                                                                            var ordersInHand = driver.orders_in_hand + 1;

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
                                                                                }
                                                                            });

                                                                        });

                                                                        Vendor.findById(order.vendor_id, function(err, vendor) {
                                                                            if (vendor != null) {
                                                                                let pushObj = new Object();
                                                                                let responseObj = new Object();
                                                                                responseObj.vendor_id = pushObj.vendor_id = order.vendor_id;
                                                                                responseObj.driver_id = pushObj.driver_id = order.driver_id;
                                                                                responseObj.pickup_id = pushObj.pickup_id = order.pickup_id;
                                                                                responseObj.order_id = pushObj.order_id = order._id;
                                                                                responseObj.pickupInfo = pushObj.pickupInfo = pickup;
                                                                                responseObj.vendorInfo = {
                                                                                    "name": vendor.name,
                                                                                    "mobile_no": vendor.mobile_no,
                                                                                    "ext": vendor.ext,
                                                                                    'profile_pic': vendor.profile_pic,
                                                                                    'bussiness_name': vendor.bussiness_name,
                                                                                    'business_loc': vendor.business_loc
                                                                                };
                                                                                responseObj.driverInfo = {
                                                                                    "name": locationInfo.driver_id.first_name,
                                                                                    "mobile_no": locationInfo.driver_id.mobile_no,
                                                                                    "ext": locationInfo.driver_id.ext,
                                                                                    'profile_pic': locationInfo.driver_id.profile_pic

                                                                                };
                                                                                pushObj.vendorInfo = {
                                                                                    "name": vendor.name,
                                                                                    "mobile_no": vendor.mobile_no,
                                                                                    "ext": vendor.ext,
                                                                                    'profile_pic': vendor.profile_pic,
                                                                                    'bussiness_name': vendor.bussiness_name,
                                                                                    'business_loc': vendor.business_loc
                                                                                };
																				pushObj.type='new';
                                                                                GCM.notifyDriver("BagDKart", pushObj, locationInfo.driver_id._id, "New Pick Up request");

                                                                                var i = 0;
                                                                                var interval = setInterval(function() {
                                                                                    console.log(i);
                                                                                    OrderStatus.findById(order._id, function(err, checkOrder) {
                                                                                        status = checkOrder.status;
                                                                                        if (i > 30) {
                                                                                            let updateObj = new Object();
                                                                                            updateObj.reason = "Request Timeout";
                                                                                            updateObj.message = "";
                                                                                            updateObj.status = 'request_timeout';
                                                                                            updateObj.actioned_by = 'server';
																							
                                                                                            OrderStatus.findOneAndUpdate({
                                                                                                _id: order._id
                                                                                            }, updateObj, {
                                                                                                new: true
                                                                                            }, function(err, orderinfo) {
																							Driver.findOne({
                                                                                                _id: orderinfo.driver_id
                                                                                            }, function(err, driver) {

                                                                                                if (err) {
                                                                                                    return err;
                                                                                                }
																								let ordersInHand=0;
                                                                                                if (driver.orders_in_hand > 0){
                                                                                                     ordersInHand = driver.orders_in_hand - 1;
																									
																									
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
                                                                                                        process.exit();

                                                                                                    }else{
																										console.log("remaining orders"+ordersInHand);
																										 clearInterval(interval);
                                                                                                         resolve();
																									}

                                                                                                });
                                                                                                }else{
																									 clearInterval(interval);
                                                                                                      resolve();
																									
																								}


                                                                                            });

                                                                                            });

                                                                                           

                                                                                        }
                                                                                        if (status == 'accepted') {

                                                                                            booked = 1;
                                                                                            globalResponse = responseObj;
                                                                                            clearInterval(interval);
                                                                                            resolve();

                                                                                        } else if (status == 'cancelled') {
                                                                                            clearInterval(interval);
                                                                                            Driver.findOne({
                                                                                                _id: orderObj.driver_id
                                                                                            }, function(err, driver) {

                                                                                                if (err) {
                                                                                                    return err;
                                                                                                }
                                                    if (driver.orders_in_hand > 0) {
														 let ordersInHand=0;
                                                         ordersInHand = driver.orders_in_hand - 1;
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
                                                        }else{
															res.status(200).send({
																status: true,
																message: "Order Cancelled Successfully",
																statusCode: 200,
																data: null
															});
															
														}

                                                    });
														 
														 
                                                    }

                                                                                            });
                                                                                            resolve();
                                                                                        }
                                                                                    });
                                                                                    i++;

                                                                                }, 1000);


                                                                            } else {

                                                                                return res.status(422).send({
                                                                                    status: false,
                                                                                    message: "Invalid vendor",
                                                                                    statusCode: 422,
                                                                                    data: null
                                                                                });
                                                                                process.exit();

                                                                            }
                                                                        });
                                                                    });
                                                                });

                                                                Promise.all([promise4])
                                                                    .then(function() {
                                                                        Promise.all([promise2, promise3,promise4])
                                                                            .then(function() {

                                                                                if (booked) {
                                                                                    res.writeHead(200, {
                                                                                        "Content-Type": "application/json"
                                                                                    });
                                                                                    res.end(JSON.stringify({
                                                                                        status: true,
                                                                                        statusCode: 200,
                                                                                        message: "Pickup saved successfully",
                                                                                        data: globalResponse,
                                                                                    }));

                                                                                } else {
                                                                                    return res.status(200).send({
                                                                                        status: true,
                                                                                        statusCode: 200,
                                                                                        message: "No Drivers Available for Pickup",
                                                                                        data: null,
                                                                                    });

                                                                                }

                                                                            }).catch(console.error);

                                                                    });
                                                            } else {
                                                                Promise.all([promise2, promise3])
                                                                    .then(function() {

                                                                        if (booked) {
                                                                            res.writeHead(200, {
                                                                                "Content-Type": "application/json"
                                                                            });
                                                                            res.end(JSON.stringify({
                                                                                status: true,
                                                                                statusCode: 200,
                                                                                message: "Pickup saved successfully",
                                                                                data: globalResponse,
                                                                            }));

                                                                        } else {
                                                                            return res.status(200).send({
                                                                                status: true,
                                                                                statusCode: 200,
                                                                                message: "No Drivers Available for Pickup",
                                                                                data: null,
                                                                            });

                                                                        }

                                                                    }).catch(console.error);




                                                            }
															
														});
													}else {
                                                                Promise.all([promise2])
                                                                    .then(function() {

                                                                        if (booked) {
                                                                            res.writeHead(200, {
                                                                                "Content-Type": "application/json"
                                                                            });
                                                                            res.end(JSON.stringify({
                                                                                status: true,
                                                                                statusCode: 200,
                                                                                message: "Pickup saved successfully",
                                                                                data: globalResponse,
                                                                            }));

                                                                        } else {
                                                                            return res.status(200).send({
                                                                                status: true,
                                                                                statusCode: 200,
                                                                                message: "No Drivers Available for Pickup",
                                                                                data: null,
                                                                            });

                                                                        }

                                                                    }).catch(console.error);
                                                            }



                                                        })
                                                    }
                                                });
							}
                                        }

                                    });


                            }
                        });


                    }


                    exports.create1 = function(req, res) {
                        let future_date = new Date();
                        future_date = future_date.toISOString();
                        if (req.body.future_date) {
                            future_date = new Date(req.body.future_date);
                            future_date = future_date.toISOString();
                        }

                        var loc = {
                            "vendor_id": req.body.vendor_id,
                            "start_loc": {
                                "type": "Point",
                                "coordinates": [parseFloat(req.body.start_lat), parseFloat(req.body.start_long)]
                            },
                            "end_loc": {
                                "type": "Point",
                                "coordinates": [parseFloat(req.body.end_lat), parseFloat(req.body.end_long)]
                            },
                            "pick_type": req.body.pick_type,
                            "request_type": req.body.request_type,
                            "coupan_id": req.body.coupan_id,
                            "package_type": req.body.package_type,
                            "delivery_type": req.body.delivery_type,
                            "customer_name": req.body.customer_name,
                            "customer_mobile": req.body.customer_mobile,
                            "customer_address": req.body.customer_address,
                            "instructions": req.body.instructions,
                            "amt": req.body.amt ? parseFloat(req.body.amt) : 0,
                            "cash_collect": req.body.cash_collect ? parseFloat(req.body.cash_collect) : 0,
                            "payment_type": req.body.payment_type,
                            "future_date": future_date,

                        }
                        //console.log(loc);

                        let new_pickup = new Pickup(loc);
                        new_pickup.save(function(err, pickup) {
                            if (err) {

                                return res.status(422).send({
                                    status: false,
                                    message: "Error in Saving Pickup",
                                    statusCode: 422,
                                    data: err
                                });

                            } else {


                                let Lat = parseFloat(req.body.start_lat);
                                let Long = parseFloat(req.body.start_long);

                                let now = new Date();

                                let query = {
                                    "loc": {
                                        $near: {
                                            $geometry: {
                                                type: "Point",
                                                coordinates: [Lat, Long]
                                            },
                                            $maxDistance: 32000,
                                            $minDistance: 0

                                        }
                                    },
                                    status: "active",
                                    driver_id: {
                                        $ne: ""
                                    },
                                    updated_at: { // 5 minutes ago (from now)
                                        $gt: new Date(now.getTime() - 1000 * 60 * 50)
                                    }
                                }


                                Location.findOne(query, function(err, location) {
                                    if (err) {
                                        return res.status(422).send({
                                            status: false,
                                            message: "Error in Parsing Lat long",
                                            statusCode: 422,
                                            data: null
                                        });
                                        //console.log(location);
                                    } else if (location != null) {
                                        let orderObj = new Object();
                                        orderObj.driver_id = location.driver_id;
                                        orderObj.vendor_id = pickup.vendor_id;
                                        orderObj.pickup_id = pickup._id;
                                        let current_time = new Date();
                                        orderObj.created_at = current_time.toISOString();
                                        orderObj.updated_at = current_time.toISOString();
                                        orderObj.status = 'new';

                                        let newOrderStatus = new OrderStatus(orderObj);
                                        newOrderStatus.save(function(err, order) {
                                            if (err) {
                                                return res.status(422).send({
                                                    status: false,
                                                    message: "Error in Updating Pickup Status",
                                                    statusCode: 422,
                                                    data: err
                                                });

                                            } else {
                                                //pickup
                                                Driver.findById(location.driver_id, function(err, driver) {
                                                    if (err) {
                                                        res.status(422).send({
                                                            status: false,
                                                            message: "Something got wrong",
                                                            statusCode: 422,
                                                            data: null
                                                        });
                                                    } else {
                                                        OrderStatus.find({
                                                            $and: [{
                                                                    driver_id: driver._id
                                                                },
                                                                {
                                                                    $or: [{
                                                                            status: 'started'
                                                                        },
                                                                        {
                                                                            status: 'new'
                                                                        },
                                                                        {
                                                                            status: 'intransit'
                                                                        }, {
                                                                            status: 'arrived'
                                                                        }, {
                                                                            status: 'waiting'
                                                                        }, {
                                                                            status: 'package picked'
                                                                        }, {
                                                                            status: 'out of delivery'
                                                                        }, {
                                                                            status: 'accepted'
                                                                        }
                                                                    ]
                                                                }
                                                            ]
                                                        }, function(err, orders) {
                                                            if (err) {
                                                                res.status(422).send({
                                                                    status: false,
                                                                    message: "Something got wrong in order status",
                                                                    statusCode: 422,
                                                                    data: null
                                                                });
                                                            } else {
                                                                if (orders.length > 2) {

                                                                    return res.status(200).send({
                                                                        status: true,
                                                                        statusCode: 200,
                                                                        message: "No Drivers Available for Pickup",
                                                                        data: null,
                                                                    });
                                                                }

                                                                Vendor.findById(order.vendor_id, function(err, vendor) {
                                                                    if (vendor != null) {

                                                                        let pushObj = new Object();
                                                                        let responseObj = new Object();
                                                                        responseObj.vendor_id = pushObj.vendor_id = order.vendor_id;
                                                                        responseObj.driver_id = pushObj.driver_id = order.driver_id;
                                                                        responseObj.pickup_id = pushObj.pickup_id = order.pickup_id;
                                                                        responseObj.order_id = pushObj.order_id = order._id;
                                                                        responseObj.pickupInfo = pushObj.pickupInfo = pickup;
                                                                        responseObj.vendorInfo = {
                                                                            "name": vendor.name,
                                                                            "mobile_no": vendor.mobile_no,
                                                                            "ext": vendor.ext,
                                                                            'profile_pic': vendor.profile_pic,
                                                                            'bussiness_name': vendor.bussiness_name,
                                                                            'business_loc': vendor.business_loc
                                                                        };
                                                                        responseObj.driverInfo = {
                                                                            "name": driver.first_name,
                                                                            "mobile_no": driver.mobile_no,
                                                                            "ext": driver.ext,
                                                                            'profile_pic': driver.profile_pic

                                                                        };
                                                                        pushObj.vendorInfo = {
                                                                            "name": vendor.name,
                                                                            "mobile_no": vendor.mobile_no,
                                                                            "ext": vendor.ext,
                                                                            'profile_pic': vendor.profile_pic,
                                                                            'bussiness_name': vendor.bussiness_name,
                                                                            'business_loc': vendor.business_loc
                                                                        };
																		
                                                                        Driver.findOneAndUpdate({
                                                                            _id: location.driver_id
                                                                        }, {}, {
                                                                            new: true
                                                                        }, function(err, driver) {
																			pushObj.type='new';
                                                                            GCM.notifyDriver("BagDKart", pushObj, location.driver_id, "New Pick Up request");


                                                                            return res.status(200).send({
                                                                                status: true,
                                                                                statusCode: 200,
                                                                                message: "Pickup saved successfully",
                                                                                data: responseObj,
                                                                            });
                                                                        });


                                                                    } else {
                                                                        res.status(422).send({
                                                                            status: false,
                                                                            message: "Invalid vendor",
                                                                            statusCode: 422,
                                                                            data: null
                                                                        });

                                                                    }
                                                                });
                                                            }
                                                        });

                                                    }
                                                });


                                            }
                                        });



                                    } else {
                                        return res.status(200).send({
                                            status: true,
                                            statusCode: 200,
                                            message: "No Drivers Available for Pickup",
                                            data: null,
                                        });

                                    }
                                });


                            }


                        });

                    }

                    exports.listRecentOrdersbyDriver = function(req, res) {
                        let driver_id = req.body.driver_id;

                        OrderStatus.find({
                            $and: [{
                                    driver_id: driver_id,
									actioned_by: {
                                      $ne: 'server'
                                    }
                                },								
                                {
                                    $or: [{
                                            status: 'new'
                                        },
                                        {
                                            status: 'intransit'
                                        }, {
                                            status: 'arrived'
                                        }, {
                                            status: 'waiting'
                                        }, {
                                            status: 'package picked'
                                        }, {
                                            status: 'out of delivery'
                                        }, {
                                            status: 'accepted'
                                        }
                                    ]
                                }
                            ]
                        }).populate('driver_id').populate('pickup_id').populate('vendor_id').sort({
                            updated_at: -1
                        }).exec(function(err, orders) {
                            if (err) {
                                res.status(422).send({
                                    status: false,
                                    message: "Error in getting Details",
                                    statusCode: 422,
                                    data: null
                                });
                            } else {


                                var ordersObj = [];

                                var promises = orders.map(function(order) {
                                    return new Promise(function(resolve, reject) {
                                        if (order.driver_id != null && order.vendor_id != null) {

                                            let pushObj = new Object();
                                            let vendor = order.vendor_id;
                                            let driver = order.driver_id;
                                            let pickup = order.pickup_id;
                                            pushObj.vendor_id = vendor._id;
                                            pushObj.order_id = order._id;
                                            pushObj.driver_id = driver._id;
                                            pushObj.pickup_id = pickup._id;
                                            pushObj._id = order._id;
                                            pushObj.reason = order.reason;
                                            pushObj.message = order.message;

                                            pushObj.status = order.status;
                                            if (order.status == 'accepted')
                                                pushObj.status = 'new';
                                            pushObj.fare = order.fare;
                                            pushObj.distance = order.distance;
                                            pushObj.actioned_by = order.actioned_by;
                                            pushObj.updated_at = order.updated_at;
                                            pushObj.created_at = order.created_at;
                                            pushObj.pickupInfo = pickup;
                                            pushObj.vendorInfo = vendor;
                                            pushObj.driverInfo = driver;
                                            pushObj.order_no = 'ODR-' + Math.random();
                                            pushObj.transaction_no = 'TRANS-' + Math.random();
                                            pushObj.pickup_time = order.start_time;
                                            pushObj.delivery_time = order.end_time;

                                            ordersObj.push(pushObj);
                                            resolve();


                                        }else{
											 resolve();
										}
                                    });
                                });
                                Promise.all(promises)
                                    .then(function() {
                                        res.status(200).send({
                                            status: true,
                                            statusCode: 200,
                                            message: "Success",
                                            data: ordersObj,
                                        });

                                    })
                                    .catch(console.error);

                            }




                        });

                    };
					//for admin all ongoing orders
					exports.listOngoingOrders = function(req, res) {
                        

                        OrderStatus.find({
                            $and: [{
                                    actioned_by: {
                                      $ne: 'server'
                                     }
                                   },

                                {
                                    $or: [{
                                            status: 'new'
                                        },
                                        {
                                            status: 'intransit'
                                        }, {
                                            status: 'arrived'
                                        }, {
                                            status: 'waiting'
                                        }, {
                                            status: 'package picked'
                                        }, {
                                            status: 'out of delivery'
                                        }, {
                                            status: 'accepted'
                                        }
                                        //  ,{status: 'delivered'}
                                    ]
                                }
							    
                            ]
                        }).populate('driver_id').populate('pickup_id').populate('vendor_id').sort({
                            updated_at: -1
                        }).exec(function(err, orders) {
                            if (err) {
                                res.status(422).send({
                                    status: false,
                                    message: "Error in getting Details",
                                    statusCode: 422,
                                    data: null
                                });
                            } else {


                                var ordersObj = [];
                                var promises = orders.map(function(order) {
                                    return new Promise(function(resolve, reject) {

                                        if (order.driver_id != null && order.vendor_id != null) {



                                            let pushObj = new Object();

                                            let vendor = order.vendor_id;
                                            let driver = order.driver_id;
                                            let pickup = order.pickup_id;
                                            pushObj.vendor_id = vendor._id;
                                            pushObj.order_id = order._id;
                                            pushObj.driver_id = driver._id;
                                            pushObj.pickup_id = pickup._id;
                                            pushObj._id = order._id;
                                            pushObj.reason = order.reason;
                                            pushObj.fare = order.fare;
                                            pushObj.distance = order.distance;
                                            pushObj.message = order.message;
                                            pushObj.status = order.status;
                                            if (order.status == 'accepted')
                                                pushObj.status = 'new';
                                            pushObj.actioned_by = order.actioned_by;
                                            pushObj.updated_at = order.updated_at;
                                            pushObj.created_at = order.created_at;
                                            pushObj.pickupInfo = pickup;
                                            pushObj.vendorInfo = vendor;
                                            pushObj.driverInfo = driver;
                                            pushObj.order_no = 'ODR-' + Math.random();
                                            pushObj.transaction_no = 'TRANS-' + Math.random();
                                            pushObj.pickup_time = order.start_time;
                                            pushObj.delivery_time = order.end_time;


                                            ordersObj.push(pushObj);
                                            resolve();


                                        }

                                    });
                                });


                                Promise.all(promises)
                                    .then(function() {
                                        res.status(200).send({
                                            status: true,
                                            statusCode: 200,
                                            message: "Success",
                                            data: ordersObj,
                                        });

                                    })
                                    .catch(console.error);

                            }
                        });

                    };

                    exports.listRecentOrdersbyVendor = function(req, res) {
                        let vendor_id = req.body.vendor_id;

                        OrderStatus.find({
                            $and: [{
                                    vendor_id: vendor_id,
									actioned_by: {
                                      $ne: 'server'
                                     }
                                   },

                                {
                                    $or: [{
                                            status: 'new'
                                        },
                                        {
                                            status: 'intransit'
                                        }, {
                                            status: 'arrived'
                                        }, {
                                            status: 'waiting'
                                        }, {
                                            status: 'package picked'
                                        }, {
                                            status: 'out of delivery'
                                        }, {
                                            status: 'accepted'
                                        }
                                        //  ,{status: 'delivered'}
                                    ]
                                }
							    
                            ]
                        }).populate('driver_id').populate('pickup_id').populate('vendor_id').sort({
                            updated_at: -1
                        }).exec(function(err, orders) {
                            if (err) {
                                res.status(422).send({
                                    status: false,
                                    message: "Error in getting Details",
                                    statusCode: 422,
                                    data: null
                                });
                            } else {


                                var ordersObj = [];
                                var promises = orders.map(function(order) {
                                    return new Promise(function(resolve, reject) {

                                        if (order.driver_id != null && order.vendor_id != null) {



                                            let pushObj = new Object();

                                            let vendor = order.vendor_id;
                                            let driver = order.driver_id;
                                            let pickup = order.pickup_id;
                                            pushObj.vendor_id = vendor._id;
                                            pushObj.order_id = order._id;
                                            pushObj.driver_id = driver._id;
                                            pushObj.pickup_id = pickup._id;
                                            pushObj._id = order._id;
                                            pushObj.reason = order.reason;
                                            pushObj.fare = order.fare;
                                            pushObj.distance = order.distance;
                                            pushObj.message = order.message;
                                            pushObj.status = order.status;
                                            if (order.status == 'accepted')
                                                pushObj.status = 'new';
                                            pushObj.actioned_by = order.actioned_by;
                                            pushObj.updated_at = order.updated_at;
                                            pushObj.created_at = order.created_at;
                                            pushObj.pickupInfo = pickup;
                                            pushObj.vendorInfo = vendor;
                                            pushObj.driverInfo = driver;
                                            pushObj.order_no = 'ODR-' + Math.random();
                                            pushObj.transaction_no = 'TRANS-' + Math.random();
                                            pushObj.pickup_time = order.start_time;
                                            pushObj.delivery_time = order.end_time;


                                            ordersObj.push(pushObj);
                                            resolve();


                                        }

                                    });
                                });


                                Promise.all(promises)
                                    .then(function() {
                                        res.status(200).send({
                                            status: true,
                                            statusCode: 200,
                                            message: "Success",
                                            data: ordersObj,
                                        });

                                    })
                                    .catch(console.error);

                            }
                        });

                    };
                    exports.pickupInfo = function(req, res) {
                        let id = req.body.id;
                        OrderStatus.findOne({
                            _id: id
                        }).populate('driver_id').populate('pickup_id').populate('vendor_id').sort({
                            updated_at: -1
                        }).exec(function(err, order) {
                            if (err) {
                                res.status(422).send({
                                    status: false,
                                    message: "Invalid Order Id",
                                    statusCode: 422,
                                    data: null
                                });

                            } else {
                                let pushObj = new Object();
                                let vendor = order.vendor_id;
                                let driver = order.driver_id;
                                let pickup = order.pickup_id;
                                pushObj.vendor_id = vendor._id;
                                pushObj.order_id = order._id;
                                pushObj.driver_id = driver._id;
                                pushObj.pickup_id = pickup._id;
                                pushObj._id = order._id;
                                pushObj.reason = order.reason;
                                pushObj.message = order.message;
                                pushObj.status = order.status;
                                if (order.status == 'accepted')
                                    pushObj.status = 'new';
                                pushObj.fare = order.fare;
                                pushObj.distance = order.distance;
                                pushObj.actioned_by = order.actioned_by;
                                pushObj.updated_at = order.updated_at;
                                pushObj.created_at = order.created_at;
                                pushObj.pickupInfo = pickup;
                                pushObj.vendorInfo = {
                                    "name": vendor.name,
                                    "mobile_no": vendor.mobile_no,
                                    "ext": vendor.ext,
                                    'profile_pic': vendor.profile_pic,
                                    'bussiness_name': vendor.bussiness_name,
                                    'business_loc': vendor.business_loc
                                };
                                pushObj.driverInfo = {
                                    "name": driver.first_name,
                                    "mobile_no": driver.mobile_no,
                                    "ext": driver.ext,
                                    'profile_pic': driver.profile_pic
                                };

                                res.status(200).send({
                                    status: true,
                                    statusCode: 200,
                                    message: "Success",
                                    data: pushObj,
                                });

                            }

                        });


                    };

                    exports.listOrdersByDriver = function(req, res) {
                        let driver_id = req.body.driver_id;
                        let query = {
                            driver_id: driver_id,
                            vendor_id: {
                                $ne: ''
                            },
							actioned_by: {
                                $ne: 'server'
                            }
                        };
                        switch (req.body.status) {

                            case '1':
                                query = {
                                    driver_id: driver_id,
                                    status: 'new',
                                    vendor_id: {
                                        $ne: ''
                                    }
                                };
								
						 OrderStatus.find(query).populate('driver_id').populate('vendor_id').populate('pickup_id').sort({
                            updated_at: -1
                        }).exec(function(err, orders) {
                            if (err) {
                                res.status(422).send({
                                    status: false,
                                    message: "Error in getting Details",
                                    statusCode: 422,
                                    data: null
                                });
                            } else {
                                var ordersObj = [];
                                var promises = orders.map(function(order) {
                                    return new Promise(function(resolve, reject) {
                                        if (order.driver_id != null && order.vendor_id != null) {
                                            let pushObj = new Object();

                                            let vendor = order.vendor_id;
                                            let driver = order.driver_id;
                                            let pickup = order.pickup_id;
                                            pushObj.vendor_id = vendor._id;
                                            pushObj.order_id = order._id;
                                            pushObj.driver_id = driver._id;
                                            pushObj.pickup_id = pickup._id;
                                            pushObj._id = order._id;
                                            pushObj.reason = order.reason;
                                            pushObj.message = order.message;
                                            pushObj.status = order.status;
                                            if (order.status == 'accepted')
                                                pushObj.status = 'new';
                                            pushObj.fare = order.fare;
                                            pushObj.distance = order.distance;
                                            pushObj.actioned_by = order.actioned_by;
                                            pushObj.updated_at = order.updated_at;
                                            pushObj.created_at = order.created_at;
                                            pushObj.pickupInfo = pickup;
                                            pushObj.vendorInfo = vendor;
                                            pushObj.driverInfo = driver;
                                            pushObj.order_no = 'ODR-' + Math.random();
                                            pushObj.transaction_no = 'TRANS-' + Math.random();
                                            pushObj.pickup_time = order.start_time;
                                            pushObj.delivery_time = order.end_time;

                                            ordersObj.push(pushObj);
                                            resolve();
                                        } else {
                                            resolve();
                                        }

                                    });
                                });

                                Promise.all(promises)
                                    .then(function() {
                                        res.status(200).send({
                                            status: true,
                                            statusCode: 200,
                                            message: "Success",
                                            data: ordersObj,
                                        });

                                    })
                                    .catch(console.error);

                            }


                        });
                                break;
                            case '2':
                                query = {
                                    driver_id: driver_id,
									$or: [{
                                            status: 'completed'
                                        },
                                        {
                                            status: 'cancelled'
                                        }],                                    
                                    vendor_id: {
                                        $ne: ''
                                    },
									 actioned_by: {
									  $ne: 'server'
									 }
                                };
								
						 OrderStatus.find(query).populate('driver_id').populate('vendor_id').populate('pickup_id').sort({
                            updated_at: -1
                        }).exec(function(err, orders) {
                            if (err) {
                                res.status(422).send({
                                    status: false,
                                    message: "Error in getting Details",
                                    statusCode: 422,
                                    data: null
                                });
                            } else {
                                var ordersObj = [];
                                var promises = orders.map(function(order) {
                                    return new Promise(function(resolve, reject) {
                                        if (order.driver_id != null && order.vendor_id != null) {
                                            let pushObj = new Object();

                                            let vendor = order.vendor_id;
                                            let driver = order.driver_id;
                                            let pickup = order.pickup_id;
                                            pushObj.vendor_id = vendor._id;
                                            pushObj.order_id = order._id;
                                            pushObj.driver_id = driver._id;
                                            pushObj.pickup_id = pickup._id;
                                            pushObj._id = order._id;
                                            pushObj.reason = order.reason;
                                            pushObj.message = order.message;
                                            pushObj.status = order.status;
                                            if (order.status == 'accepted')
                                                pushObj.status = 'new';
                                            pushObj.fare = order.fare;
                                            pushObj.distance = order.distance;
                                            pushObj.actioned_by = order.actioned_by;
                                            pushObj.updated_at = order.updated_at;
                                            pushObj.created_at = order.created_at;
                                            pushObj.pickupInfo = pickup;
                                            pushObj.vendorInfo = vendor;
                                            pushObj.driverInfo = driver;
                                            pushObj.order_no = 'ODR-' + Math.random();
                                            pushObj.transaction_no = 'TRANS-' + Math.random();
                                            pushObj.pickup_time = order.start_time;
                                            pushObj.delivery_time = order.end_time;

                                            ordersObj.push(pushObj);
                                            resolve();
                                        } else {
                                            resolve();
                                        }

                                    });
                                });

                                Promise.all(promises)
                                    .then(function() {
                                        res.status(200).send({
                                            status: true,
                                            statusCode: 200,
                                            message: "Success",
                                            data: ordersObj,
                                        });

                                    })
                                    .catch(console.error);

                            }


                        });
                        break;
                        case '0':
                                query = {
                                    driver_id: driver_id,
                                    status: {
                                        $ne: 'completed'
                                    },
                                    status: {
                                        $ne: 'new'
                                    },
                                    status: {
                                        $ne: 'cancelled'
                                    },
                                    vendor_id: {
                                        $ne: ''
                                    },
								actioned_by: {
                                  $ne: 'server'
                                 }
                                };
								
						 OrderStatus.find(query).populate('driver_id').populate('vendor_id').populate('pickup_id').sort({
                            updated_at: -1
                        }).exec(function(err, orders) {
                            if (err) {
                                res.status(422).send({
                                    status: false,
                                    message: "Error in getting Details",
                                    statusCode: 422,
                                    data: null
                                });
                            } else {
                                var ordersObj = [];
                                var promises = orders.map(function(order) {
                                    return new Promise(function(resolve, reject) {
                                        if (order.driver_id != null && order.vendor_id != null && order.status!='completed') {
                                            let pushObj = new Object();

                                            let vendor = order.vendor_id;
                                            let driver = order.driver_id;
                                            let pickup = order.pickup_id;
                                            pushObj.vendor_id = vendor._id;
                                            pushObj.order_id = order._id;
                                            pushObj.driver_id = driver._id;
                                            pushObj.pickup_id = pickup._id;
                                            pushObj._id = order._id;
                                            pushObj.reason = order.reason;
                                            pushObj.message = order.message;
                                            pushObj.status = order.status;
                                            if (order.status == 'accepted')
                                                pushObj.status = 'new';
                                            pushObj.fare = order.fare;
                                            pushObj.distance = order.distance;
                                            pushObj.actioned_by = order.actioned_by;
                                            pushObj.updated_at = order.updated_at;
                                            pushObj.created_at = order.created_at;
                                            pushObj.pickupInfo = pickup;
                                            pushObj.vendorInfo = vendor;
                                            pushObj.driverInfo = driver;
                                            pushObj.order_no = 'ODR-' + Math.random();
                                            pushObj.transaction_no = 'TRANS-' + Math.random();
                                            pushObj.pickup_time = order.start_time;
                                            pushObj.delivery_time = order.end_time;

                                            ordersObj.push(pushObj);
                                            resolve();
                                        } else {
                                            resolve();
                                        }

                                    });
                                });

                                Promise.all(promises)
                                    .then(function() {
                                        res.status(200).send({
                                            status: true,
                                            statusCode: 200,
                                            message: "Success",
                                            data: ordersObj,
                                        });

                                    })
                                    .catch(console.error);

                            }


                        });
								
								
                                break;
                        }




                    };
                    exports.listOrdersbyVendor = function(req, res) {
                        let vendor_id = req.body.vendor_id;
                        let query = {
                            vendor_id: vendor_id,
                            driver_id: {
                                $ne: ''
                            },
							actioned_by: {
                                $ne: 'server'
                            }
                        };
                        switch (req.body.status) {

                            case '1':
                                query = {
                                    vendor_id: vendor_id,
                                    status: 'new',
                                    driver_id: {
                                        $ne: ''
                                    },
							     actioned_by: {
                                  $ne: 'server'
                                 }
                                };
								
								                        OrderStatus.find(query).populate('vendor_id').populate('driver_id').populate('pickup_id').sort({
                            updated_at: -1
                        }).exec(function(err, orders) {
                            if (err) {
                                res.status(422).send({
                                    status: false,
                                    message: "Error in getting Details",
                                    statusCode: 422,
                                    data: null
                                });
                            } else {
                                var ordersObj = [];
                                //console.log(orders);
                                var promises = orders.map(function(order) {
                                    return new Promise(function(resolve, reject) {

                                        if (order.driver_id != null && order.vendor_id != null) {
                                            let pushObj = new Object();

                                            let vendor = order.vendor_id;
                                            let driver = order.driver_id;
                                            let pickup = order.pickup_id;
                                            pushObj.vendor_id = vendor._id;
                                            pushObj.order_id = order._id;
                                            pushObj.driver_id = driver._id;
                                            pushObj.fare = order.fare;
                                            pushObj.distance = order.distance;
                                            pushObj.pickup_id = pickup._id;
                                            pushObj._id = order._id;
                                            pushObj.reason = order.reason;
                                            pushObj.message = order.message;
                                            pushObj.status = order.status;
                                            if (order.status == 'accepted')
                                                pushObj.status = 'new';
                                            pushObj.actioned_by = order.actioned_by;
                                            pushObj.updated_at = order.updated_at;
                                            pushObj.created_at = order.created_at;
                                            pushObj.pickupInfo = pickup;
                                            pushObj.vendorInfo = vendor;
                                            pushObj.driverInfo = driver;
                                            pushObj.order_no = 'ODR-' + Math.random();
                                            pushObj.transaction_no = 'TRANS-' + Math.random();
                                            pushObj.pickup_time = order.start_time;
                                            pushObj.delivery_time = order.end_time;


                                            ordersObj.push(pushObj);
                                            resolve();

                                        } else {
                                            resolve();
                                        }

                                    });
                                });

                                Promise.all(promises)
                                    .then(function() {
                                        res.status(200).send({
                                            status: true,
                                            statusCode: 200,
                                            message: "Success",
                                            data: ordersObj,
                                        });

                                    })
                                    .catch(console.error);

                            }
                        });
                                break;
                            case '2':
                                query = {
                                     vendor_id: vendor_id,
									$or: [{
                                            status: 'completed'
                                        },
                                        {
                                            status: 'cancelled'
                                        }],                                    
                                    vendor_id: {
                                        $ne: ''
                                    },
									 actioned_by: {
									  $ne: 'server'
									 }
                                };
						 OrderStatus.find(query).populate('vendor_id').populate('driver_id').populate('pickup_id').sort({
                            updated_at: -1
                        }).exec(function(err, orders) {
                            if (err) {
                                res.status(422).send({
                                    status: false,
                                    message: "Error in getting Details",
                                    statusCode: 422,
                                    data: null
                                });
                            } else {
                                var ordersObj = [];
                                //console.log(orders);
                                var promises = orders.map(function(order) {
                                    return new Promise(function(resolve, reject) {

                                        if (order.driver_id != null && order.vendor_id != null) {
                                            let pushObj = new Object();

                                            let vendor = order.vendor_id;
                                            let driver = order.driver_id;
                                            let pickup = order.pickup_id;
                                            pushObj.vendor_id = vendor._id;
                                            pushObj.order_id = order._id;
                                            pushObj.driver_id = driver._id;
                                            pushObj.fare = order.fare;
                                            pushObj.distance = order.distance;
                                            pushObj.pickup_id = pickup._id;
                                            pushObj._id = order._id;
                                            pushObj.reason = order.reason;
                                            pushObj.message = order.message;
                                            pushObj.status = order.status;
                                            if (order.status == 'accepted')
                                                pushObj.status = 'new';
                                            pushObj.actioned_by = order.actioned_by;
                                            pushObj.updated_at = order.updated_at;
                                            pushObj.created_at = order.created_at;
                                            pushObj.pickupInfo = pickup;
                                            pushObj.vendorInfo = vendor;
                                            pushObj.driverInfo = driver;
                                            pushObj.order_no = 'ODR-' + Math.random();
                                            pushObj.transaction_no = 'TRANS-' + Math.random();
                                            pushObj.pickup_time = order.start_time;
                                            pushObj.delivery_time = order.end_time;


                                            ordersObj.push(pushObj);
                                            resolve();

                                        } else {
                                            resolve();
                                        }

                                    });
                                });

                                Promise.all(promises)
                                    .then(function() {
                                        res.status(200).send({
                                            status: true,
                                            statusCode: 200,
                                            message: "Success",
                                            data: ordersObj,
                                        });

                                    })
                                    .catch(console.error);

                            }
                        });
								
								
                                break;
                            case '0':
                                query = {
                                    vendor_id: vendor_id,
                                    status: {
                                        $ne: 'completed'
                                    },
                                    status: {
                                        $ne: 'new'
                                    },
                                    status: {
                                        $ne: 'cancelled'
                                    },
                                    driver_id: {
                                        $ne: ''
                                    },
							        actioned_by: {
                                      $ne: 'server'
                                    }
                                };
								
						 OrderStatus.find(query).populate('vendor_id').populate('driver_id').populate('pickup_id').sort({
                            updated_at: -1
                        }).exec(function(err, orders) {
                            if (err) {
                                res.status(422).send({
                                    status: false,
                                    message: "Error in getting Details",
                                    statusCode: 422,
                                    data: null
                                });
                            } else {
                                var ordersObj = [];
                                //console.log(orders);
                                var promises = orders.map(function(order) {
                                    return new Promise(function(resolve, reject) {

                                        if (order.driver_id != null && order.vendor_id != null && order.status!='completed') {
                                            let pushObj = new Object();
                                            let vendor = order.vendor_id;
                                            let driver = order.driver_id;
                                            let pickup = order.pickup_id;
                                            pushObj.vendor_id = vendor._id;
                                            pushObj.order_id = order._id;
                                            pushObj.driver_id = driver._id;
                                            pushObj.fare = order.fare;
                                            pushObj.distance = order.distance;
                                            pushObj.pickup_id = pickup._id;
                                            pushObj._id = order._id;
                                            pushObj.reason = order.reason;
                                            pushObj.message = order.message;
                                            pushObj.status = order.status;
                                            if (order.status == 'accepted')
                                                pushObj.status = 'new';
                                            pushObj.actioned_by = order.actioned_by;
                                            pushObj.updated_at = order.updated_at;
                                            pushObj.created_at = order.created_at;
                                            pushObj.pickupInfo = pickup;
                                            pushObj.vendorInfo = vendor;
                                            pushObj.driverInfo = driver;
                                            pushObj.order_no = 'ODR-' + Math.random();
                                            pushObj.transaction_no = 'TRANS-' + Math.random();
                                            pushObj.pickup_time = order.start_time;
                                            pushObj.delivery_time = order.end_time;


                                            ordersObj.push(pushObj);
                                            resolve();

                                        } else {
                                            resolve();
                                        }

                                    });
                                });

                                Promise.all(promises)
                                    .then(function() {
                                        res.status(200).send({
                                            status: true,
                                            statusCode: 200,
                                            message: "Success",
                                            data: ordersObj,
                                        });

                                    })
                                    .catch(console.error);

                            }
                        });
                                break;
                        }



                    };

                    exports.deleteLocation = function(req, res) {


                        Location.remove({
                            _id: req.params.id
                        }, function(err, Location) {
                            if (err) {
                                res.status(422).send({
                                    status: false,
                                    message: "Error in Deleting Location",
                                    statusCode: 422,
                                    data: null
                                });
                            } else {
                                res.json({
                                    message: 'Location successfully deleted'
                                });
                            }
                        });
                    };

                    var milesToRadian = function(miles) {
                        var earthRadiusInMiles = 3959;
                        return miles / earthRadiusInMiles;
                    };


                    exports.getNearBy = function(req, res) {

                        let Lat = parseFloat(req.body.lat);
                        let Long = parseFloat(req.body.long);
                        req.body.miles = 10000;

                        let query = {
                            "loc": {
                                $geoWithin: {
                                    $centerSphere: [
                                        [Lat, Long], milesToRadian(req.body.miles)
                                    ]
                                }
                            }
                        };

                        Location.find(query).limit(5).exec(function(err, result) {
                            if (err) {
                                res.status(422).send({
                                    status: false,
                                    message: "Something got wrong",
                                    statusCode: 422,
                                    data: null
                                });
                            } else {

                                let locations = JSON.parse(JSON.stringify(result));
                                let lat_longs = [];

                                Object.keys(locations).map(function(objectKey, index) {
                                    let value = locations[objectKey];
                                    let temp = new Object();
                                    temp.latitude = value.loc.coordinates[0];
                                    temp.longitude = value.loc.coordinates[1];
                                    temp.angle = value.angle;
                                    lat_longs[objectKey] = temp;
                                });

                                res.status(200).send({
                                    status: true,
                                    statusCode: 200,
                                    message: "Success",
                                    data: lat_longs,
                                });
                            }
                        });

                    };
                    exports.deleteLocations = function(req, res) {

                        Location.remove({
                            driver_id: '5aace04f1289aa003cac9200'
                        }, function() {});
                    };




                    exports.getLocation = function(req, res) {
                        Location.findOne({
                            driver_id: req.body.driver_id
                        }, function(err, result) {
                            if (err) {
                                res.status(422).send({
                                    status: false,
                                    message: "Something got wrong",
                                    statusCode: 422,
                                    data: null
                                });
                            } else {
                                if (result) {
                                    res.status(200).send({
                                        status: true,
                                        statusCode: 200,
                                        message: "Success",
                                        data: result,
                                    });
                                } else {
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
                    exports.listOrders = function(req, res) {
                        OrderStatus.find({}, function(err, orders) {
                            if (err)
                                res.send(err);
                            res.json(orders);
                        });
                    };

                    exports.deleteOrders = function(req, res) {

                        OrderStatus.remove({
                            driver_id: '5aee6b28b60c1800447bff57'
                        }, function() {});
                    };
                    exports.listLocations = function(req, res) {

                        Location.find({}, function(err, location) {
                            if (err)
                                res.send(err);
                            res.json(location);
                        });

                    };


                    exports.setLocation = function(req, res) {
                        let Lat = parseFloat(req.body.lat);
                        let Long = parseFloat(req.body.long);

                        let loc = {
                            "driver_id": req.body.driver_id,
                            "loc": {
                                "type": "Point",
                                "coordinates": [Lat, Long]
                            }
                        }

                        Location.findOne({
                            driver_id: req.body.driver_id
                        }, function(err, result) {

                            if (result) {

                                Location.findOneAndUpdate({
                                    _id: result._id
                                }, loc, {
                                    new: true
                                }, function(err, location) {
                                    //console.log(res);
                                    if (err) {
                                        res.status(422).send({
                                            status: false,
                                            message: "Error in Updating Location",
                                            statusCode: 422,
                                            data: null
                                        });
                                    } else {
                                        res.status(200).send({
                                            status: true,
                                            statusCode: 200,
                                            message: "Location Updated Successfully",
                                            data: location,
                                        });
                                    }

                                });
                            } else {
                                let new_location = new Location(loc);
                                new_location.save(function(err, location) {
                                    if (err) {

                                        return res.status(422).send({
                                            status: false,
                                            message: "Error in Saving Location",
                                            statusCode: 422,
                                            data: err
                                        });

                                    } else {


                                        return res.status(200).send({
                                            status: true,
                                            statusCode: 200,
                                            message: "Location saved successfully",
                                            data: location,
                                        });
                                    }


                                });

                            }
                        });


                    };
                    exports.deleteVendorPickups = function(req, res) {

                        Pickup.remove({
                            'vendor_id': '5b6aa6d09365c0004c97ac24'
                        }, function(err, vendor) {
                            if (err) {
                                res.send(err);
                            } else {
                                res.json({
                                    message: 'Vendor pickup deleted successfully deleted'
                                });
                            }
                        });
						
						

                    };