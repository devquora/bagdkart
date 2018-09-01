const mongoose = require('mongoose'),
schema = mongoose.Schema,
bcrypt = require('bcryptjs');

const vendorSchema = new schema ({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true,
        index: {
            unique: true
        }
    },
    password: {
        type: String,
        required: true,
        selected: false
    },
    profilePic: {
        type: Object,
    },
    employeeId: {
        type: String,
        required: true
    },
    phoneNumber: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        index: {
            unique: true
        }
    },
    businessName: {
        type: String,
        required: true
    },
    businessAddress: {
        type: String,
        required: true
    },
    subscription: {
        type: String,
        required: true
    },
    dateOfSubscriptionSigned: {
        type: String,
        // required: true
    },
    device_id: {
        type: String,
        required: true
    },
    role:{
        type: String,
        // required: true
    },
    firebase_key: {
        type: String,
    },
    device_type: {
        type: String
    },
    country_code: {
        type: String
    }
},{
	timestamps: {
		createdAt: "created_at",
		updatedAt: "updated_at"
	}
});

vendorSchema.pre('save', function(next) {
    let vendorValues = this;
    console.log(`in pre save`);
    bcrypt.hash(vendorValues.password, 10).then((hash)=> {
        vendorValues.password = hash; //if there is no error we are going to hash
        console.log(hash);
        next();
    }).catch((err)=> {
        console.log(err);
    });
});

vendorSchema.methods.comparePassword = function(pwd){
	let vInfo = this;
	return bcrypt.compareSync(pwd, vInfo.password);
};

const vendorData = mongoose.model('vendorInfo', vendorSchema);

module.exports = {
    vendorData
};