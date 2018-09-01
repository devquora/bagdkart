'use strict';
const Vendor = require('../models/Vendor');
const Driver = require('../models/Driver');
let gcm = require('node-gcm');

let driverKey="AAAAt_8pzWQ:APA91bHUOrE6Okyd-i4NULzcfAj71b3eMd9lhHtg2Nm8kL1oWoVIr-fyTnJlCDNf1iGbkx5k9Cu7GfBTLeeG1jcmGEjwW4knbHr-F7IaxIL934SZWQcO5YOdzj9MPPU0STAER-bHawJX";

let vendorKey="AAAAyNxACfs:APA91bEdv34vVQGnyRpldWKjpDfnjvIAhUYpzhW2W2qhb9kKOGMFbbM-1ML-KdgCrEN3GdkrPSdf7G6p0Qg3pi_t6QZNUy8OrJpczGwgKopKNw6n0caTKyu3kz3gBtWBdP9w9hLnOOc8";

exports.notifyVendor = function(title,body,id,message_str){
	//console.log(id);
	Vendor.findOne({'_id':id}, function(err, result) {
			 if (err) {
					console.log(err);
				} else {
					if(result){
							if(result.device_type=='android'){
							let message = new gcm.Message({
								data: {
									title: title,
									message:message_str,
									body: message_str,
									data:body
										
									}						
								
							});
					
						 	let sender = new gcm.Sender(vendorKey);	
							sender.send(message, { registrationTokens:[result.gcm_id] }, function (err, response) {
								if (err) 
								 console.error(err);
								else 
								 console.log(response);
							});
						 
							}else{
								
								
									let message = new gcm.Message({
								    notification: {
									title: title,
									message:message_str,
									body: message_str,
									payload:body
									}									
												

								
							});
					
						 	let sender = new gcm.Sender(vendorKey);	
							sender.send(message, { registrationTokens:[result.gcm_id] }, function (err, response) {
								if (err) 
								 console.error(err);
								else 
								 console.log(response);
							});
						 
								
							}
					



					}
				}
	});

	
}


exports.notifyDriver = function(title,body,id,message_str){
	Driver.findOne({'_id':id}, function(err, result) {
			 if (err) {
					console.log(err);
				} else {
						if(result){
							if(result.device_type=='android'){
							let message = new gcm.Message({
								
								
								data: {
									"title": title,
									"message":message_str,
									"body": body,
																		
								}											

								
							});
					
						 	let sender = new gcm.Sender(driverKey);	
							sender.send(message, { registrationTokens:[result.gcm_id] }, function (err, response) {
								if (err) 
								 console.error(err);
								else 
								 console.log(response);
							});
						 
							}else{
								
								
							let message = new gcm.Message({
				
								 "content_available": true,
								 "mutable_content":true,

								"notification" :{
													  "body" : message_str,
													  "title" : title,
													  
												},
							     "data" : {
										title   : title,
										body    : body, 
										intended_user : message_str
								}

								
							});
					
						 	let sender = new gcm.Sender(driverKey);	
							sender.send(message, { registrationTokens:[result.gcm_id] }, function (err, response) {
								if (err) 
								 console.error(err);
								else 
								 console.log(response);
							});
						 
								
							}
					



					}
				}
	});

	
}
