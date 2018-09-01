'use strict';
    const cors = require('cors'),
    testing = require('../../handlers/test'),
    Vendor = require('../controllers/VendorController'),
	Admin = require('../controllers/AdminController'),
	Driver = require('../controllers/DriverController'),
    Location = require('../controllers/LocationController'),
	Upload = require('../controllers/UploadController'),
	Address = require('../controllers/AddressController'),
	Pickup = require('../controllers/PickupController'),
    Rating= require('../controllers/RatingController'),
	Subscription= require('../controllers/SubscriptionController'),
	Truncate= require('../controllers/TruncateController');
module.exports = (app, express)=> {
    const api = express.Router();
	
    api.get('/vendor/sendMobileVerification', Vendor.sendMobileVerification);
	api.get('/vendor/:id',Vendor.readVendor);
	api.post('/vendor/resendOTP', Vendor.resendOTP); //done
	app.post('/upload/vendorProfile',Upload.vendorProfilePic);//done
	api.post('/vendor/setPassword', Vendor.setPassword); //done
	api.post('/vendor/setMobile', Vendor.setPassword); //done
	api.get('/vendor',Vendor.listVendors);
	api.post('/vendor',Vendor.createVendor); //done
	api.put('/vendor/:id',Vendor.updateVendor); //done
	api.delete('/vendor/:id',Vendor.deleteVendor);
	api.post('/vendorLogin',Vendor.authenticateVendor); //done
	api.post('/adminLogin',Admin.authenticate); //done
	api.get('/admin/list',Admin.listUsers); //done
	api.get('/admin/:id',Admin.getDetails); //done
	api.put('/admin/:id',Admin.updateAdmin); //done
	api.post('/admin/resetEmail',Admin.sendResetEmail); //done
	api.delete('/admin/:id',Admin.deleteAdmin);
	api.post('/admin/resetPassword/:token',Admin.resetPassword);
	
	api.post('/createAdmin',Admin.create); //done
	//api.post('/changeVendorPassword',Vendor.authenticateVendor);
	api.post('/sendResetEmail',Vendor.sendResetEmail);
	api.post('/verifyVendorOtp',Vendor.verifyOtp);//done
	api.post('/resetpassword/mobile',Vendor.resetByMobile);//done
	//api.post('/reset/vendor/password/:id',Vendor.vendorResetPassword);
	
	api.post('/rating/',Rating.create);
	api.get('/getRatingByVendor/:id',Rating.getRatingByVendor);
	api.get('/getRatingByDriver/:id',Rating.getRatingByDriver);
	api.delete('/rating/:id',Rating.deleteRating);
	api.get('/listRating',Rating.getRatingByVendor);
	app.all('/upload/*', function(req, res, next) {
		res.header("Access-Control-Allow-Origin", "*");
		res.header("Access-Control-Allow-Headers", "X-Requested-With");
		next();
	});
	api.post('/subscription/',Subscription.create);
	api.put('/subscription/:id',Subscription.updateSubscription);
	api.get('/getPayAS',Subscription.getPayAS);
	api.get('/subscriptions',Subscription.subscriptions);
	api.get('/caterings',Subscription.caterings);
	api.get('/global-setting',Subscription.globalSetting);
	api.get('/listBusinesses',Vendor.listBusinesses);
	
	api.get('/subscription/:id',Subscription.readRecord);
	api.delete('/subscription/:id',Subscription.deleteSubscription);
//	api.get('/driver/sendMobileVerification', Driver.driverMobileVerification); 
	api.post('/driver/resendOTP', Driver.resendOTP);
	app.post('/upload/driverProfile',Upload.driverProfilePic);
	api.post('/driver/setPassword', Driver.setPassword);
	api.get('/driver/',Driver.listDrivers);
	api.post('/driver/',Driver.createDriver);
	api.get('/driver/:id',Driver.readDriver);
	api.put('/driver/:id',Driver.updateDriver);
	api.delete('/driver/:id',Driver.deleteDriver);
	api.post('/driverLogin',Driver.authenticateDriver);
	api.post('/changeDriverPassword',Driver.authenticateDriver);
	api.post('/driverResetPassword',Driver.driverResetPassword);
	api.post('/verifyDriverOtp',Driver.verifyOtp);
	app.post('/upload/drivingLicense',Upload.drivingLicense);
	app.post('/upload/policeVerfication',Upload.policeVerfication);
	app.post('/upload/registrationCert',Upload.registrationCert);
	api.post('/driver/resetpassword/mobile',Driver.resetByMobile);//done
	app.post('/upload/packageImages',Upload.uploadPackageImages);
	api.post('/setLocation',Location.setLocation);
	api.post('/location/setStatus',Location.setStatus);
	api.post('/getLocation',Location.getLocation);
	api.get('/listLocations',Location.listLocations);
	api.get('/listDriversOnMap',Driver.listDriversOnMap);
	api.get('/listVendorsOnMap',Vendor.listVendorsOnMap);
	api.post('/getNearBy',Location.getNearBy);
	
	api.get('/deleteLocations',Location.deleteLocations);
	api.get('/deleteOrders',Pickup.deleteOrders);
	
	/*
	api.get('/deleteLocations',Location.deleteLocations);
	api.get('/deleteAllDrivers',Driver.deleteDriver);
	api.get('/deleteAllVendors',Vendor.deleteVendor);
	api.get('/deleteOrders',Pickup.deleteOrders);
	api.get('/deleteAllAddress',Address.deleteAllAddress);*/
	
	
	
	//Address Api's
	api.post('/address',Address.create); 
	api.put('/address/:id',Address.updateAddress);
	api.delete('/address/:id',Address.deleteAddress);
	api.get('/truncateAll',Truncate.index)
	api.post('/pickup',Pickup.create);
	api.post('/cancelRequest',Pickup.cancelRequest);
	api.post('/pickup/setStatus',Pickup.setStatus);
	api.post('/pickup/getStatus',Pickup.getStatus);
	api.post('/order/markCompleted',Upload.markCompleted);
	api.post('/calculateFare',Subscription.calculateFare);
	api.post('/saveFare',Subscription.saveFare);
	
	api.get('/listOngoingOrders',Pickup.listOngoingOrders);
	api.post('/pickup/updateInfo',Pickup.updatePickupInfo);
	api.get('/listOrders',Pickup.listOrders);
	api.post('/pickupInfo',Pickup.pickupInfo);
	api.post('/listOrdersByVendor',Pickup.listOrdersbyVendor);
	api.post('/listOrdersByDriver',Pickup.listOrdersByDriver);
	api.post('/listRecentOrders/driver',Pickup.listRecentOrdersbyDriver);
	api.post('/listRecentOrders/vendor',Pickup.listRecentOrdersbyVendor);
	api.delete('/deleteVendorPickups',Pickup.deleteVendorPickups);
	api.delete('/deleteVendorOrders',Vendor.deleteVendorOrders);
	
	// list order by id
	// waiting time
    return api;
}