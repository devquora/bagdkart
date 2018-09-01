'use strict';
const cfenv = require('cfenv');
const appEnv = cfenv.getAppEnv();
const Subscription = require('../models/Subscription');
let createToken = require('../comman/createToken');
const OrderStatus = require('../models/OrderStatus');
let bcrypt = require('bcrypt');
const sgMail = require('@sendgrid/mail');

var fs = require('fs');
var https = require('https');

sgMail.setApiKey("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");

exports.saveFare= function(req, res) {
	let miles = req.body.miles,
	    order_id  = req.body.order_id,
        subscriptionType = req.body.subscription_type;
		if(miles>=100){
		subscriptionType='catering';
	}
	let fare=0;
	let cost_per_mile=0;
	let to_miles=0;
	switch(subscriptionType){
		case 'pay_as_go':
		Subscription.find({subscription_type: 'pay_as_go'}, function(err, subscriptions) {
        if (err)
            res.send(err);
		   		
			 var sPromises = subscriptions.map(function(subscription) {
				 return new Promise(function(resolve, reject) {				
				if(subscription.fare_type=='base'){
				   fare=parseFloat(subscription.fare);
				   to_miles=subscription.to_mile;
				   
				   if(miles<=to_miles){
					   
							Subscription.find({subscription_type: 'global','status':'active'}, function(err, globalFares) {

								 if(!globalFares[0]){
									
									resolve();
									 
								 }else{
								   var promises = globalFares.map(function(globalFare) {
									  return new Promise(function(resolve, reject) {
										  fare=parseFloat(fare);
											if(globalFare.fare_type=='flat'){
												
												fare=fare+parseFloat(globalFare.fare_value);
												
											}else{
												console.log(globalFare.fare_value);
												fare =fare+(parseFloat(fare)*parseFloat(globalFare.fare_value))/100
											}
											
											resolve();

										});
								   });							  
								Promise.all(promises)
								.then(function() { 
							      resolve();
										
								 })
								.catch(console.error);
								
								 }

								});
					   
				   }else{
					    resolve();
				   }
				   
				}else{
				   let left_miles=0;
				   if(miles>to_miles){
						left_miles= miles- to_miles;
						fare +=parseFloat(left_miles)*parseFloat(subscription.fare);
							Subscription.find({subscription_type: 'global','status':'active'}, function(err, globalFares) {

								 if(!globalFares[0]){
									console.log('resolved');
									resolve();
									 
								 }else{
								   var promises = globalFares.map(function(globalFare) {
									  return new Promise(function(resolve, reject) {
										  fare=parseFloat(fare);
											if(globalFare.fare_type=='flat'){
												
												fare=fare+parseFloat(globalFare.fare_value);
												
											}else{
												console.log(globalFare.fare_value);
												fare =fare+(parseFloat(fare)*parseFloat(globalFare.fare_value))/100
											}
											
											resolve();

										});
								   });							  
								Promise.all(promises)
								.then(function() { 
									resolve();
										
								 })
								.catch(console.error);
								
								 }

								});
					   
				   }else{
					
					resolve();
					
				   }				   
					
				}
			});			
			});
							Promise.all(sPromises)
								.then(function() { 
								
								 let reqData = new Object();
								 reqData.fare = fare.toFixed(2);
								 reqData.distance = miles;
								 reqData._id = order_id;
								 reqData.order_type=subscriptionType;
								
								OrderStatus.findOneAndUpdate({
									_id: order_id
								}, reqData, {
									new: true
								}, function(err, orderStatus) {
									if (err) {
										return res.status(422).send({
											status: false,
											message: "Error in calculating Fare",
											statusCode: 422,
											data: null
										});
									}else{
									res.writeHead(200, {"Content-Type": "application/json"});
											res.end(JSON.stringify({
														status: true,
														statusCode: 200,
														message: "success",
														data:reqData,
									}));
									return;
										
									}
								});
								
								
	
								 })
								.catch(console.error);
			
			
     	 });
		break;
		 
	case 'subscription':
		Subscription.find({subscription_type: 'subscription'}, function(err, subscriptions) {
        if (err)
            res.send(err);
			subscriptions.forEach((subscription) => {
				
				if(miles<=subscription.to_mile){
					fare=subscription.fare;
								 let reqData = new Object();
								 reqData.fare = fare.toFixed(2);
								 reqData.distance = miles;
								 reqData._id = order_id;
								 reqData.order_type=subscriptionType;
								OrderStatus.findOneAndUpdate({
									_id: order_id
								}, reqData, {
									new: true
								}, function(err, orderStatus) {
									if (err) {
										return res.status(422).send({
											status: false,
											message: "Error in calculating Fare",
											statusCode: 422,
											data: null
										});
									}else{
									res.writeHead(200, {"Content-Type": "application/json"});
											res.end(JSON.stringify({
														status: true,
														statusCode: 200,
														message: "success",
														data:reqData,
									}));
									return;
										
									}
								});
								
									
					
				}else{
					miles=parseFloat(miles);
					let extra_miles=miles-parseFloat(subscription.to_mile);
					fare=parseFloat(subscription.fare);
					fare+=extra_miles*parseFloat(subscription.cost_per_mile);
													 let reqData = new Object();
								 reqData.fare = fare.toFixed(2);
								 reqData.distance = miles;
								 reqData._id = order_id;
								 reqData.order_type=subscriptionType;
								OrderStatus.findOneAndUpdate({
									_id: order_id
								}, reqData, {
									new: true
								}, function(err, orderStatus) {
									if (err) {
										return res.status(422).send({
											status: false,
											message: "Error in calculating Fare",
											statusCode: 422,
											data: null
										});
									}else{
									res.writeHead(200, {"Content-Type": "application/json"});
											res.end(JSON.stringify({
														status: true,
														statusCode: 200,
														message: "success",
														data:reqData,
									}));
									return;
										
									}
								});
								
					
					
				}		
							
			});
     	 });
	break;
	
	case 'catering':
		Subscription.find({subscription_type: 'catering'}, function(err, subscriptions) {
				        if (err)
            res.send(err);
		   		
			 var sPromises = subscriptions.map(function(subscription) {
				 return new Promise(function(resolve, reject) {				
				if(subscription.fare_type=='base'){
				   fare=parseFloat(subscription.fare);
				   to_miles=subscription.to_mile;
				   
				   if(miles<=to_miles){
					   
							Subscription.find({subscription_type: 'global','status':'active'}, function(err, globalFares) {

								 if(!globalFares[0]){
									
									resolve();
									 
								 }else{
								   var promises = globalFares.map(function(globalFare) {
									  return new Promise(function(resolve, reject) {
										  fare=parseFloat(fare);
											if(globalFare.fare_type=='flat'){
												
												fare=fare+parseFloat(globalFare.fare_value);
												
											}else{
												console.log(globalFare.fare_value);
												fare =fare+(parseFloat(fare)*parseFloat(globalFare.fare_value))/100
											}
											
											resolve();

										});
								   });							  
								Promise.all(promises)
								.then(function() { 
							      resolve();
										
								 })
								.catch(console.error);
								
								 }

								});
					   
				   }else{
					    resolve();
				   }
				   
				}else{
				   let left_miles=0;
				   if(miles>to_miles){
						left_miles= miles- to_miles;
						fare +=parseFloat(left_miles)*parseFloat(subscription.fare);
							Subscription.find({subscription_type: 'global','status':'active'}, function(err, globalFares) {

								 if(!globalFares[0]){
									console.log('resolved');
									resolve();
									 
								 }else{
								   var promises = globalFares.map(function(globalFare) {
									  return new Promise(function(resolve, reject) {
										  fare=parseFloat(fare);
											if(globalFare.fare_type=='flat'){
												
												fare=fare+parseFloat(globalFare.fare_value);
												
											}else{
												console.log(globalFare.fare_value);
												fare =fare+(parseFloat(fare)*parseFloat(globalFare.fare_value))/100
											}
											
											resolve();

										});
								   });							  
								Promise.all(promises)
								.then(function() { 
									resolve();
										
								 })
								.catch(console.error);
								
								 }

								});
					   
				   }else{
					
					resolve();
					
				   }				   
					
				}
			});			
			});
							Promise.all(sPromises)
								.then(function() { 
								 let reqData = new Object();
								 reqData.fare = fare.toFixed(2);
								 reqData.distance = miles;
								 reqData._id = order_id;
								 reqData.order_type=subscriptionType;
								
								OrderStatus.findOneAndUpdate({
									_id: order_id
								}, reqData, {
									new: true
								}, function(err, orderStatus) {
									if (err) {
										return res.status(422).send({
											status: false,
											message: "Error in calculating Fare",
											statusCode: 422,
											data: null
										});
									}else{
									res.writeHead(200, {"Content-Type": "application/json"});
											res.end(JSON.stringify({
														status: true,
														statusCode: 200,
														message: "success",
														data:reqData,
									}));
									return;
										
									}
								});
									
								 })
								.catch(console.error);
     	 });
	break;
		
		
	}
		
		
	
	
}



exports.calculateFare = function(req, res) {
	let miles = req.body.miles,
        subscriptionType = req.body.subscription_type;
	if(miles>=100){
		subscriptionType='catering';
	}
	 let fare=0;
	let cost_per_mile=0;
	let to_miles=0;
	switch(subscriptionType){
		case 'pay_as_go':
		Subscription.find({subscription_type: 'pay_as_go'}, function(err, subscriptions) {
        if (err)
            res.send(err);
		   		
			 var sPromises = subscriptions.map(function(subscription) {
				 return new Promise(function(resolve, reject) {				
				if(subscription.fare_type=='base'){
				   fare=parseFloat(subscription.fare);
				   to_miles=subscription.to_mile;
				   
				   if(miles<=to_miles){
					   
							Subscription.find({subscription_type: 'global','status':'active'}, function(err, globalFares) {

								 if(!globalFares[0]){
									
									resolve();
									 
								 }else{
								   var promises = globalFares.map(function(globalFare) {
									  return new Promise(function(resolve, reject) {
										  fare=parseFloat(fare);
											if(globalFare.fare_type=='flat'){
												
												fare=fare+parseFloat(globalFare.fare_value);
												
											}else{
												console.log(globalFare.fare_value);
												fare =fare+(parseFloat(fare)*parseFloat(globalFare.fare_value))/100
											}
											
											resolve();

										});
								   });							  
								Promise.all(promises)
								.then(function() { 
							      resolve();
										
								 })
								.catch(console.error);
								
								 }

								});
					   
				   }else{
					    resolve();
				   }
				   
				}else{
				   let left_miles=0;
				   if(miles>to_miles){
						left_miles= miles- to_miles;
						fare +=parseFloat(left_miles)*parseFloat(subscription.fare);
							Subscription.find({subscription_type: 'global','status':'active'}, function(err, globalFares) {

								 if(!globalFares[0]){
									console.log('resolved');
									resolve();
									 
								 }else{
								   var promises = globalFares.map(function(globalFare) {
									  return new Promise(function(resolve, reject) {
										  fare=parseFloat(fare);
											if(globalFare.fare_type=='flat'){
												
												fare=fare+parseFloat(globalFare.fare_value);
												
											}else{
												console.log(globalFare.fare_value);
												fare =fare+(parseFloat(fare)*parseFloat(globalFare.fare_value))/100
											}
											
											resolve();

										});
								   });							  
								Promise.all(promises)
								.then(function() { 
									resolve();
										
								 })
								.catch(console.error);
								
								 }

								});
					   
				   }else{
					
					resolve();
					
				   }				   
					
				}
			});			
			});
							Promise.all(sPromises)
								.then(function() { 
									res.writeHead(200, {"Content-Type": "application/json"});
											res.end(JSON.stringify({
														status: true,
														statusCode: 200,
														message: "success",
														data: {'estimated_fare':fare.toFixed(2)},
									}));
									return;	
								 })
								.catch(console.error);
			
			
     	 });
		break;
		 
	case 'subscription':
		Subscription.find({subscription_type: 'subscription'}, function(err, subscriptions) {
        if (err)
            res.send(err);
			subscriptions.forEach((subscription) => {
				
				if(miles<=subscription.to_mile){
					fare=subscription.fare;
					res.writeHead(200, {"Content-Type": "application/json"});
							res.end(JSON.stringify({
										status: true,
										statusCode: 200,
										message: "success",
										data: {'estimated_fare':fare.toFixed(2)},
					}));
					return;
									
					
				}else{
					miles=parseFloat(miles);
					let extra_miles=miles-parseFloat(subscription.to_mile);
					fare=parseFloat(subscription.fare);
					fare+=extra_miles*parseFloat(subscription.cost_per_mile);
					res.writeHead(200, {"Content-Type": "application/json"});
							res.end(JSON.stringify({
										status: true,
										statusCode: 200,
										message: "success",
										data: {'estimated_fare':fare.toFixed(2)},
					}));
					return;
					
				}		
							
			});
     	 });
	break;
	
	case 'catering':
		Subscription.find({subscription_type: 'catering'}, function(err, subscriptions) {
				        if (err)
            res.send(err);
		   		
			 var sPromises = subscriptions.map(function(subscription) {
				 return new Promise(function(resolve, reject) {				
				if(subscription.fare_type=='base'){
				   fare=parseFloat(subscription.fare);
				   to_miles=subscription.to_mile;
				   
				   if(miles<=to_miles){
					   
							Subscription.find({subscription_type: 'global','status':'active'}, function(err, globalFares) {

								 if(!globalFares[0]){
									
									resolve();
									 
								 }else{
								   var promises = globalFares.map(function(globalFare) {
									  return new Promise(function(resolve, reject) {
										  fare=parseFloat(fare);
											if(globalFare.fare_type=='flat'){
												
												fare=fare+parseFloat(globalFare.fare_value);
												
											}else{
												console.log(globalFare.fare_value);
												fare =fare+(parseFloat(fare)*parseFloat(globalFare.fare_value))/100
											}
											
											resolve();

										});
								   });							  
								Promise.all(promises)
								.then(function() { 
							      resolve();
										
								 })
								.catch(console.error);
								
								 }

								});
					   
				   }else{
					    resolve();
				   }
				   
				}else{
				   let left_miles=0;
				   if(miles>to_miles){
						left_miles= miles- to_miles;
						fare +=parseFloat(left_miles)*parseFloat(subscription.fare);
							Subscription.find({subscription_type: 'global','status':'active'}, function(err, globalFares) {

								 if(!globalFares[0]){
									console.log('resolved');
									resolve();
									 
								 }else{
								   var promises = globalFares.map(function(globalFare) {
									  return new Promise(function(resolve, reject) {
										  fare=parseFloat(fare);
											if(globalFare.fare_type=='flat'){
												
												fare=fare+parseFloat(globalFare.fare_value);
												
											}else{
												console.log(globalFare.fare_value);
												fare =fare+(parseFloat(fare)*parseFloat(globalFare.fare_value))/100
											}
											
											resolve();

										});
								   });							  
								Promise.all(promises)
								.then(function() { 
									resolve();
										
								 })
								.catch(console.error);
								
								 }

								});
					   
				   }else{
					
					resolve();
					
				   }				   
					
				}
			});			
			});
							Promise.all(sPromises)
								.then(function() { 
									res.writeHead(200, {"Content-Type": "application/json"});
											res.end(JSON.stringify({
														status: true,
														statusCode: 200,
														message: "success",
														data: {'estimated_fare':fare.toFixed(2)},
									}));
									return;	
								 })
								.catch(console.error);
     	 });
	break;
		
		
	}

	
}

exports.getPayAS = function(req, res) {
    Subscription.find({subscription_type: 'pay_as_go'}, function(err, subscription) {
        if (err)
            res.send(err);
        res.json(subscription);
    });
};

exports.caterings = function(req, res) {
    Subscription.find({subscription_type: 'catering'}, function(err, subscription) {
        if (err)
            res.send(err);
        res.json(subscription);
    });
};

exports.globalSetting = function(req, res) {
    Subscription.find({subscription_type: 'global'}, function(err, subscription) {
        if (err)
            res.send(err);
        res.json(subscription);
    });
};

exports.subscriptions = function(req, res) {
    Subscription.find({subscription_type: 'subscription'}, function(err, subscription) {
        if (err)
            res.send(err);
        res.json(subscription);
    });
};


exports.readRecord = function(req, res) {
    Subscription.findById(req.params.id, function(err, subscription) {
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
                data: subscription,
            });
        }
    });
};

exports.getDetails = function(req, res) {
    Subscription.findById(req.params.id, function(err, subscription) {
        if (err) {
            res.status(422).send({
                status: false,
                message: "Something got wrong",
                statusCode: 422,
                data: null
            });
        } else {
			if(subscription!=null){
			   return res.status(200).send({
                    status: true,
                    statusCode: 200,
                    message: "Subscription Details",
                    data: subscription,
                });
							
			}else{
		   res.status(422).send({
                status: false,
                message: "Invalid subscription Id",
                statusCode: 422,
                data: null
            });
			}
        }
    });
};
exports.updateSubscription = function(req, res) {
	
	let email= req.body.email;
	req.body.email=email.toLowerCase();
    
	Subscription.findOneAndUpdate({
        _id: req.params.id
    }, req.body, {
        new: true
    }, function(err, subscription) {

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
                message: "Subscription Updated Successfully",
                data: subscription,
            });
			
		
        }

    });
};

exports.deleteSubscription = function(req, res) {
    Subscription.remove({
       '_id':req.params.id
    }, function(err, subscription) {
        if (err) {
            res.status(422).send({
                status: true,
                statusCode: 200,
                message: "Error in deleting Record",
                data: "",
            });
        } else {
			
			
			Subscription.find({_id: { $ne: '5b1e24476425c22b44583600' }}, function(err, subscription) {
			if (err)
				res.send(err);
			
				res.status(200).send({
					status: true,
					statusCode: 200,
					message: "Record successfully deleted",
					data: subscription,
				});
			});	
			

        }
    });
};


exports.create = function(req, res) {
    //console.log(req.body);
   
    let subscription = new Subscription(req.body);

    subscription.save(function(err, subscription) {
            if (err) {
                if (err.code == 11000) {
							Subscription.findOneAndUpdate({
								_id: req.body._id
							}, req.body, {
								new: true
							}, function(err, subscription) {

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
										message: "Subscription Updated Successfully",
										data: subscription,
									});
									
								
								}

							});
				
				
                } else {
                    return res.send(err);
                }
            } else {
				
				
						return res.status(200).send({
                            status: true,
                            statusCode: 200,
                            message: "Subscription saved successfully",
                            data: subscription,
                        });
				
				

				

  

            }

        });
 };


