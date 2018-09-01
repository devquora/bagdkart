'use strict';
const Rating = require('../models/Rating');
const Promise = require('promise');
const Vendor = require('../models/Vendor');
exports.create = function(req, res) {
	
    var rating = { 
	            "driver_id":req.body.driver_id,
				"vendor_id":req.body.vendor_id,
				"actioned_by":req.body.actioned_by,
				"rating":req.body.rating,
				"comments":req.body.comments,
			 }
 
 
	       let new_rating = new Rating(rating);
	       new_rating.save(function(err, rating) {
			      if (err) {
                        
                            return res.status(422).send({
                                status: false,
                                message: "Error in saving rating",
                                statusCode: 422,
                                data: null
                            });
                        
                    } else {


                        return res.status(200).send({
                            status: true,
                            statusCode: 200,
                            message: "Rating saved successfully",
                            data: rating,
                        });
                    }
			   
			   
		   });
	
}


exports.deleteRating = function(req, res) {


    Rating.remove({
         '_id':req.params.id
    }, function(err, Rating) {
        if (err) {
            res.status(422).send({
                status: false,
                message: "Error in Deleting Rating",
                statusCode: 422,
                data: null
            });
        }else {
            res.json({
                message: 'Rating successfully deleted'
            });
        }
    });
};
exports.listRating = function(req, res) {
    Rating.find({}, function(err, rating) {
        if (err)
            res.send(err);
        res.json(rating);

    });
};

exports.getRatingByVendor = function(req, res) {
	Rating.find({
        vendor_id: req.params.id,
		actioned_by:'vendor'
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
						message: "Something got wrong:Invalid Vendor Id",
						statusCode: 422,
						data: null
					});
						
					}
				}
		
	});
	
}
exports.getRatingByDriver = function(req, res) {
	let	responseObj =[];
	Rating.find({
        driver_id: req.params.id,
		actioned_by:'vendor'
    }, function(err, results) {
			 if (err) {
					res.status(422).send({
						status: false,
						message: "Something got wrong",
						statusCode: 422,
						data: null
					});
				} else {
					if(results){
							let i=0;
	
					  var promises = results.map(function(result) {
							  return new Promise(function(resolve, reject) {
								  
								  let newResponse=new Object();
									newResponse.driver_id=result.driver_id;
									newResponse.vendor_id  =result.vendor_id;
									newResponse._id  =result._id;
									newResponse.rating=result.rating;
									newResponse.comments=result.comments;
									newResponse.created_at=result.created_at;
									newResponse.vendor_name="";
									newResponse.vendor_profile_pic="";
									newResponse.bussiness_name="";
									newResponse.bussiness_phone="";
									newResponse.mobile_no="";
									Vendor.findOne({'_id':result.vendor_id}, function(err, vendor) {
										
										if (vendor){
											
											newResponse.vendor_name=vendor.name;
											newResponse.vendor_profile_pic=vendor.profile_pic;
											newResponse.bussiness_name=vendor.bussiness_name;
											newResponse.bussiness_phone=vendor.bussiness_phone;
											newResponse.mobile_no=vendor.ext+'-'+vendor.mobile_no;
											

										}
										
										resolve();
										responseObj[i]=newResponse;
										i++;	
																				
									
									});
									
									
								  
							  });
					  });
						
						
					Promise.all(promises)
					.then(function() { 
							res.status(200).send({
									status: true,
									statusCode: 200,
									message: "Success",
									data: responseObj,
							});

					 })
					.catch(console.error);
						

					}else{
						res.status(422).send({
						status: false,
						message: "Something got wrong:Invalid Driver Id",
						statusCode: 422,
						data: null
					});
						
					}
				}
		
	});
	
}


