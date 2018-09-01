function loopUntillaccepted(req,res,pickup){
	let cancelledDrivers=[];
	let i=0;
	OrderStatus.find({pickup_id: pickup._id,status:'cancelled'
    }, function(err, Orders) {
		var promises = Orders.map(function(cancelledOrders) {
			return new Promise(function(resolve, reject) {
				resolve();
				cancelledDrivers[i]=cancelledOrders.driver_id;
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
				driver_id:{
					$nin:cancelledDrivers
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
if(locationInfo){
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
					let status='new';
					
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
                           GCM.notifyDriver("BagDKart", pushObj, locationInfo.driver_id._id, "New Pick Up request");
							var i=0;
							console.log(order._id);
							var interval=setInterval(function() {
								OrderStatus.findById(order._id, function(err, checkOrder) {	
								status=checkOrder.status;
								if(i>9){
									    let updateObj = new Object();
										updateObj.reason ="Request Timeout";
										updateObj.message = req.body.message;
										updateObj.status = 'request_timeout';
										updateObj.actioned_by = 'server';
										OrderStatus.findOneAndUpdate({
											_id: order._id
										}, updateObj, {
											new: true
										}, function(err, orderStatus) {
											
											
										});
									
									    clearInterval(interval);
									
								}
								if(status=='accepted'){
									/*return res.status(200).send();*/
								
									clearInterval(interval);
								resolve();	
								}else if(status=='cancelled'){
							clearInterval(interval);
							Driver.findOne({
                                _id: orderObj.driver_id
                            }, function(err, driver) {

                                if (err) {
                                    return err;
                                }
								if(driver.orders_in_hand>0){
								    var ordersInHand = driver.orders_in_hand - 1;
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
										
										
										loopUntillaccepted(req,res,pickup);
										
										
									
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

			}else{
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

