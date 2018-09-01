'use strict';
const Location = require('../models/Location');
const Driver = require('../models/Driver');
exports.create = function(req, res) {
	
    Driver.findOne({
        _id: req.body.driver_id,
    }, function(err, result) {
		
		
		if(result==null){
			  return res.status(422).send({
                                status: false,
                                message: "Error in Saving Location:Invalid Driver ID",
                                statusCode: 422,
                                data: null
                            });
			
		}else{
	       var loc = { 
	            "driver_id":req.body.driver_id,
				 "loc": { 
					 "type": "Point",
					 "coordinates": [req.body.lat,req.body.long]
				 }
			 }
 
 
	       let new_location = new Location(loc);
	       new_location.save(function(err, location) {
			      if (err) {
                        
                            return res.status(422).send({
                                status: false,
                                message: "Error in Saving Location",
                                statusCode: 422,
                                data: null
                            });
                        
                    } else {


                        return res.status(200).send({
                            status: true,
                            statusCode: 200,
                            message: "Location saved successfully",
                            data: location,
                        });
                    }
			   
			   
		   });
		}
	});
	
}


exports.deleteLocation = function(req, res) {


    Location.remove({
       
    }, function(err, Location) {
        if (err) {
            res.status(422).send({
                status: false,
                message: "Error in Deleting Location",
                statusCode: 422,
                data: null
            });
        }else {
            res.json({
                message: 'Location successfully deleted'
            });
        }
    });
};

var milesToRadian = function(miles){
    var earthRadiusInMiles = 3959;
    return miles / earthRadiusInMiles;
};

exports.setStatus=function(req, res){
	let Dstatus=req.body.status;
	  let last_login = new Date();
     last_login = last_login.toISOString();
	Location.findOne({
        driver_id: req.body.driver_id
    }, function(err, result) {
			 if (err) {
					res.status(422).send({
						status: false,
						message: "Something got wrong",
						statusCode: 422,
						data: null
					});
				} else {
						if(result){
		    				Location.findOneAndUpdate({
							 _id: result._id
							},{'status':Dstatus,'updated_at':last_login},{upsert: true},function(err, location) {
								if (err) {
									res.status(422).send({
										status: false,
										message: "Something got wrong",
										statusCode: 422,
										data: null
									});
								}else{
									location.status=Dstatus;
									res.status(200).send({
										status: true,
										statusCode: 200,
										message: "Success",
										data: location,
									});
									
								}
								
							});
						}else{
							res.status(422).send({
								status: false,
								message: "Invalid Driver Id",
								statusCode: 422,
								data: null
							});
							
						}
				}
			
				});
	
}
exports.getNearBy = function(req, res) {

let Lat=parseFloat(req.body.lat);
let Long=parseFloat(req.body.long);
console.log(Lat);
console.log(Long);
let now = new Date();
let query = {
    "loc" : {
        $geoWithin : {
            $centerSphere : [[Lat,Long], milesToRadian(req.body.miles) ]
        }
    },
	status: "active",
	driver_id: { $ne: "" },
	updated_at: { // 5 minutes ago (from now)
								$gt: new Date(now.getTime() - 1000 * 60 * 60)
	}
};

Location.find(query).limit(5).exec( function(err, result) {
	     if (err) {

					res.status(422).send({
						status: false,
						message: "Something got wrong",
						statusCode: 422,
						data: err
					});
				} else {
					
					let locations = JSON.parse(JSON.stringify(result));
					let lat_longs= [];
					
					Object.keys(locations).map(function(objectKey, index) {
						let value = locations[objectKey];
						let temp=new Object();
						temp.driver_id=value.driver_id;
						temp.latitude=value.loc.coordinates[0];
						temp.longitude=value.loc.coordinates[1];
						temp.angle=value.angle;
						lat_longs[objectKey]=temp;
					});
					
					res.status(200).send({
						status: true,
						statusCode: 200,
						message: "Success",
						data: lat_longs,
					});
					}
});
	
};
exports.deleteLocations = function(req, res) {

Location.remove({driver_id:null }, function(){
		res.status(200).send({
						status: true,
						message: "deleted all",
						statusCode: 200,
						data: null
					});
	
	
});
};

exports.getLocation = function(req, res) {
	Location.findOne({
        driver_id: req.body.driver_id
    }, function(err, result) {
			 if (err) {
					res.status(422).send({
						status: false,
						message: "Something got wrong",
						statusCode: 422,
						data: null
					});
				} else {
					if(result){
					res.status(200).send({
						status: true,
						statusCode: 200,
						message: "Success",
						data: result,
					});
					}else{
						res.status(422).send({
						status: false,
						message: "Something got wrong:Invalid Id",
						statusCode: 422,
						data: null
					});
						
					}
				}
		
	});
	
}
exports.listLocations = function(req, res) {
    Location.find({}).populate('driver_id').exec(function(err, location) {
        if (err)
            res.send(err);
        res.json(location);
    });
};

exports.setLocation = function(req, res) {
	let Lat=parseFloat(req.body.lat);
	let Long=parseFloat(req.body.long);
	 let last_login = new Date();
     last_login = last_login.toISOString();
	
	  let loc = { 
	            "driver_id":req.body.driver_id,
				 "loc": { 
					 "type": "Point",
					 "coordinates": [Lat,Long]
				 },
				 "updated_at":last_login
			 }
		
	Location.findOne({
        driver_id: req.body.driver_id
    }, function(err, result) {
	
	if(result){
		    
			Location.findOneAndUpdate({
			 _id: result._id
			},loc,{upsert: true},function(err, location) {
				//console.log(res);
				if (err) {
					res.status(422).send({
						status: false,
						message: "Error in Updating Location",
						statusCode: 422,
						data: null
					});
				} else {
					res.status(200).send({
						status: true,
						statusCode: 200,
						message: "Location Updated Successfully",
						data: location,
					});
				}
				
			});
	    }else{
		   let new_location = new Location(loc);
	       new_location.save(function(err, location) {
			      if (err) {
                        
                            return res.status(422).send({
                                status: false,
                                message: "Error in Saving Location",
                                statusCode: 422,
                                data: null
                            });
                        
                    } else {


                        return res.status(200).send({
                            status: true,
                            statusCode: 200,
                            message: "Location saved successfully",
                            data: location,
                        });
                    }
			   
			   
		   });
			
		}
	});
	

};
