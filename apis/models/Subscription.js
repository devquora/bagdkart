'use strict';
var mongoose = require('mongoose');
var SubscriptionSchema = new mongoose.Schema({
	from_mile: {
		type: Number,
		default: 0
	},
	to_mile: {
		type: Number,
		default: 1
	},
	fare: {
		type: Number,
		default: 0
	},
	subscription_type: {
		type: String,
		default: 'pay_as_go'
	},
	max_delivery_distance: {
		type: Number,
		default: 0
	},
	price_per_month: {
		type: Number,
		default: 1
	},
	price_above_range: {
		type: Number,
		default: 1
	},
	cost_per_mile: {
		type: Number,
		default: 1
	},
	status: {
		type: String,
		default: 'active'
	},
	fare_name:{
		type: String,
		default: ''
	},
	fare_type:{
		type: String,
		default: ''
	},
	fare_value:{
		type: String,
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
SubscriptionSchema.index({ "start_loc": "2dsphere" });
SubscriptionSchema.index({ "end_loc": "2dsphere" });
var Subscription = mongoose.model('Subscription', SubscriptionSchema);


module.exports = Subscription;