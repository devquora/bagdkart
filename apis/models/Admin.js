'use strict';
var mongoose = require('mongoose');
var bcrypt = require('bcrypt');
var AdminSchema = new mongoose.Schema({
	first_name: {
		type: String,
		required: false,
		trim: true,
		default: ''
	},
	last_name: {
		type: String,
		required: false,
		trim: true,
		default: ''
	},
	email: {
		type: String,
		required: true,
		trim: true,
		unique : true,
	},
	bussiness_name: {
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
	country: {
		type: String,
		default: ''
	},
	mobile_no: {
		type: String,
		trim: true,
		default: 0,
		
	},
	ext: {
		type: String,
		trim: true,
		default: '',
		
	},
	phone2: {
		type: String,
		trim: true,
		default: 0,
		
	},
	phone1: {
		type: String,
		trim: true,
		default: 0,
		
	},
	mobile_verified: {
		type: Number,
		default:0
		
	},
	email_verified: {
		type: Number,
		default:0
		
	},
	profile_pic: {
		type: String,
		trim: true,
		default: ''
	},
	user_type: {
		type: String,
		default: 'admin'
	},
	device_type: {
		type: String,
		default: 'android'
	},
	status: {
		type: String,
		default: 'inactive'
	},
	superAdmin: {
		type: Number,
		default:0
	},
    password: {
		type: String,
		required: false,
		default: ''
		
	},
	
	auth_token: {
		type: String,
	},
	resetPasswordToken:{
	 type:String	
	},
	resetPasswordExpires:{
	 type: Date,	
	},
	created_at: {
		type: Date,
		default: Date.now
	},
	last_login: {
		type: Date,
		default: Date.now
	},
	updated_at: {
		type: Date,
		default: Date.now
	}
});
AdminSchema.pre('save', function(next) {
    let userValues = this;
	
	if(userValues.password!=undefined && userValues.password!=null && userValues.password !=""){
		bcrypt.hash(userValues.password, 10).then((hash)=> {
			userValues.password = hash; //if there is no error we are going to hash
			next();
		}).catch((err)=> {
			console.log(err);
		});
	}else{
		
		next();
	}
});
AdminSchema.methods.generatePassword = function(pwd){
       bcrypt.hash(pwd, 10).then((hash)=> {
			return  hash; //if there is no error we are going to hash
		
		}).catch((err)=> {
			console.log(err);
		});
};
AdminSchema.methods.comparePassword = function(pwd){
        let uInfo = this;
        return bcrypt.compareSync(pwd, uInfo.password);
};
var Admin = mongoose.model('Admin', AdminSchema);
/*
Vendor.update(
     {uid: 'uid'}, 
     {otp : '' },
     {multi:true}, 
       function(err, numberAffected){  
       });

Vendor.collection.dropIndex('mobile_no_1', function(err, result) {
    if (err) {
        console.log('Error in dropping index!', err);
    }
});*/
module.exports = Admin;