'use strict';
var mongoose = require('mongoose');
var bcrypt = require('bcrypt');

var DriverSchema = new mongoose.Schema({
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
	emp_id: {
		type: String,
		trim: true,
		default: ''
	},

	dob: {
		type: Date,
		default: Date.now
	},
	address: {
		type: String,
		trim: true,
		default: ''
	},
	locality: {
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
	mobile_verified: {
		type: Number,
		default:0
		
	},
	email_verified: {
		type: Number,
		default:0
		
	},
	document_verified: {
		type: Number,
		default:1
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
	driving_license: {
		type: String,
		trim: true,
		default: ''
	},
	police_verfication: {
		type: String,
		trim: true,
		default: ''
	},
	registration_cert: {
		type: String,
		trim: true,
		default: ''
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
	orders_in_hand:{
		type: Number,
		default:0
	},
	otp: {
		type: String,
        default:"",
        trim: true,		 
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

DriverSchema.pre('save', function(next) {
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


DriverSchema.methods.comparePassword = function(pwd){
        let uInfo = this;
        return bcrypt.compareSync(pwd, uInfo.password);
};

var Driver = mongoose.model('Driver', DriverSchema);

/*Driver.collection.dropIndex('mobile_no_1', function(err, result) {
    if (err) {
        console.log('Error in dropping index!', err);
    }
});*/
module.exports = Driver;