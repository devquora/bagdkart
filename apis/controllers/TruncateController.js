'use strict';
const Rating = require('../models/Rating');
const Address = require('../models/Address');
const Driver = require('../models/Driver');
const Location = require('../models/Location');
const OrderStatus = require('../models/OrderStatus');
const PickUp = require('../models/PickUp');
const Vendor = require('../models/Vendor');


exports.index = function(req, res) {
	/*Rating.remove({}, function(err, vendor){
		console.log('Truncated Table Rating');
	});*/
	/*Address.remove({}, function(err, vendor){
		console.log('Truncated Table Address');
	});*/
	
	Location.remove({}, function(err, vendor){
		console.log('Truncated Table Location');
	});

	OrderStatus.remove({}, function(err, vendor){
		console.log('Truncated Table OrderStatus');
	});
	PickUp.remove({}, function(err, vendor){
		console.log('Truncated Table PickUp');
	});
/*	Vendor.remove({}, function(err, vendor){
		console.log('Truncated Table Vendor');
	});	
	Driver.remove({}, function(err, vendor){
		console.log('Truncated Table Driver');
	});*/
}
