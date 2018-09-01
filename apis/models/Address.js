'use strict';
var mongoose = require('mongoose');
var AddressSchema = new mongoose.Schema({
	vendor_id: {
		type: String,
		trim: true,
		default: ''
	},
	address_type: {
		type: String,
		trim: true,
		default: ''
	},
	address_lane1: {
		type: String,
		trim: true,
		default: ''
	},
	address_lane2: {
		type: String,
		trim: true,
		default: ''
	},
	city: {
		type: String,
		trim: true,
		default: ''
	},
	state: {
		type: String,
		trim: true,
		default: ''
	},
	zipcode: {
		type: String,
		trim: true,
		default: ''
	},
	country_code: {
		type: String,
		default: ''
	}
});

var Address = mongoose.model('Address', AddressSchema);

module.exports = Address;