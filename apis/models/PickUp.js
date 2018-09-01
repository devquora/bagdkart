'use strict';
var mongoose = require('mongoose');
var PickUpSchema = new mongoose.Schema({
	vendor_id: {
		type: String,
		trim: true,
		default: ''
	},
	start_loc: {
		type: {
			type: String
		},
		coordinates: []
	},
	end_loc: {
		type: {
			type: String
		},
		coordinates: []
	},
	pick_type: {
		type: String,
		default: 'catering'
	},
	request_type: {
		type: String,
		default: ''
	},
	coupan_id: {
		type: String,
		default: ''
	},
	package_type: {
		type: String,
		default: 'now'
	},
	delivery_type: {
		type: String,
		default: 'express'
	},
	customer_name: {
		type: String,
		default: ''
	},
	customer_mobile: {
		type: String,
		default: ''
	},
	customer_address: {
		type: String,
		default: ''
	},
	instructions: {
		type: String,
		default: ''
	},
	amt: {
		type: Number,
		default: 0
	},
	cash_collect:{
		type: Number,
		default: 0
	},
	payment_type: {
		type: String,
		default: ''
	},
	future_date: {
		type: Date,
		default: ""
	},
	package_image1: {
		type: String,
		trim: true,
		default: ''
	},
	package_image2: {
		type: String,
		trim: true,
		default: ''
	},
	package_image3: {
		type: String,
		trim: true,
		default: ''
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
PickUpSchema.index({ "start_loc": "2dsphere" });
PickUpSchema.index({ "end_loc": "2dsphere" });
var Pickup = mongoose.model('Pickup', PickUpSchema);


module.exports = Pickup;