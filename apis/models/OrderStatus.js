'use strict';
var mongoose = require('mongoose');
var OrderSchema = new mongoose.Schema({
	vendor_id: {
		type: String,
		trim: true,
		ref: 'Vendor',
		default: ''
	},
	driver_id: {
		type: String,
		trim: true,
		ref: 'Driver',
		default: ''
	},
	pickup_id: {
		type: String,
		trim: true,
		default: '',
		ref: 'Pickup',
	},
	reason: {
		type: String,
		default: ''
	},
	actioned_by:{
		type: String,
		default: 'driver'
	},
	message: {
		type: String,
		default: ''
	},
	status: {
		type: String,
		default: 'new' 
	},
	fare:{
		type: String,
		default: 0 
		
	},
	order_type:{
		type: String,
		default: "" 
	},
	distance:{
		type: String,
		default: 0 
		
	},
	document: {
		type: String,
		default: 'new' 
	},
	start_time: {
		type: Date,
		default: Date.now
	},
	end_time: {
		type: Date,
		default: Date.now
	},
	created_at: {
		type: Date,
		default: Date.now
	},
	updated_at: {
		type: Date,
		default: Date.now
	}

});

var OrderStatus = mongoose.model('OrderStatus', OrderSchema);


module.exports = OrderStatus;