'use strict';
var mongoose = require('mongoose');
var LocationSchema = new mongoose.Schema({
	driver_id: {
		type: String,
		trim: true,
		ref: 'Driver',
		default: ''
	},
	loc: {
        type: { type: String },
        coordinates: []
    },
	
	angle: {
       type: String,
	   default: ''
	 } ,			
	status: {
       type: String,
	   default: 'active'
	 } ,	
   created_at: {
		type: Date,
		default: Date.now
	},
	updated_at: {
		type: Date,
		default: Date.now
	}
	
});
LocationSchema.index({ "loc": "2dsphere" });
var Location = mongoose.model('Location', LocationSchema);


module.exports = Location;