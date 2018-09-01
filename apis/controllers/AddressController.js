'use strict';
const Address = require('../models/Address');

exports.create = function(req, res) {
	       let new_address = new Address(req.body);
	       new_address.save(function(err, driver) {
			      if (err) {
                        
                            return res.status(422).send({
                                status: false,
                                message: "Error in Creating Address",
                                statusCode: 422,
                                data: null
                            });
                        
                    } else {


                        return res.status(200).send({
                            status: true,
                            statusCode: 200,
                            message: "Address created successfully",
                            data: driver,
                        });
                    }
			   
			   
		   });
	
}


exports.deleteAddress = function(req, res) {


    Address.remove({
        _id: req.params.id
    }, function(err, Address) {
        if (err) {
            res.status(422).send({
                status: false,
                message: "Error in Deleting Address",
                statusCode: 422,
                data: null
            });
        }else {
            res.json({
                message: 'Address successfully deleted'
            });
        }
    });
};

exports.deleteAllAddress = function(req, res) {


    Address.remove({
       
    }, function(err, Address) {
        if (err) {
            res.status(422).send({
                status: false,
                message: "Error in Deleting Address",
                statusCode: 422,
                data: null
            });
        }else {
            res.json({
                message: 'Address successfully deleted'
            });
        }
    });
};




exports.updateAddress = function(req, res) {
	
	Address.findOneAndUpdate({
        _id: req.params.id
    }, req.body, {
        new: true
    }, function(err, address) {
        if (err) {
            res.status(422).send({
                status: false,
                message: "Error in Updating Address",
                statusCode: 422,
                data: null
            });
        } else {
            res.status(200).send({
                status: true,
                statusCode: 200,
                message: "Address Updated Successfully",
                data: address,
            });
        }
    });
};
