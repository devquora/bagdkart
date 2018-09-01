'use strict';
var mongoose = require('mongoose');
var RatingSchema = new mongoose.Schema({
	driver_id: {
		type: String,
		trim: true,
		default: ''
	},
	vendor_id: {
		type: String,
		trim: true,
		default: ''
	},	
	actioned_by: {
		type: String,
		trim: true,
		default: ''
	},
	rating: {
		type: String,
		trim: true,
		default: ''
	},
	comments: {
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

var Rating = mongoose.model('Rating', RatingSchema);


module.exports = Rating;