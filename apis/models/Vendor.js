'use strict';
var mongoose = require('mongoose');
var bcrypt = require('bcrypt');
var VendorSchema = new mongoose.Schema({
	name: {
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
	bussiness_phone: {
		type: String,
		trim: true,
		default: ''
	},
	business_loc: {
		type: {
			type: String
		},
		coordinates: []
	},
	emp_id: {
		type: String,
		trim: true,
		default: ''
	},
	dob: {
		type: Date,
		default: Date.now
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
	device_id: {
		type: String,
		required: true,
		trim: true,
		default: ''
	},
	gcm_id: {
		type: String,
		required: true,
		trim: true,
		default: ''
	},
	profile_pic: {
		type: String,
		trim: true,
		default: ''
	},
	user_type: {
		type: String,
		default: 'personal'
	},
	device_type: {
		type: String,
		default: 'android'
	},
	status: {
		type: String,
		default: 'pending'
	},
    password: {
		type: String,
		required: false,
		default: ''
		
	},
	auth_token: {
		type: String,
	},
	social: {
		type: String,
		default:""
	},
	otp: {
		type: String,
		trim: true,
		default:"",
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
VendorSchema.pre('save', function(next) {
    let userValues = this;
	
	if(userValues.password!=undefined && userValues.password!=null && userValues.password !=""){
		bcrypt.hash(userValues.password, 10).then((hash)=> {
			userValues.password = hash; //if there is no error we are going to hash
			userValues.otp = Math.floor(1000 + Math.random() * 9000);
		//	console.log(hash);
			next();
		}).catch((err)=> {
			console.log(err);
		});
	}else{
		
		next();
	}
});
VendorSchema.methods.generatePassword = function(pwd){
       bcrypt.hash(pwd, 10).then((hash)=> {
			return  hash; //if there is no error we are going to hash
		
		}).catch((err)=> {
			console.log(err);
		});
};
VendorSchema.methods.comparePassword = function(pwd){
        let uInfo = this;
        return bcrypt.compareSync(pwd, uInfo.password);
};
var Vendor = mongoose.model('Vendor', VendorSchema);
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
module.exports = Vendor;