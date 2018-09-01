const express = require('express'),
app = express(),
server = require('http').createServer(app),
bodyParser = require('body-parser'),
cfenv = require('cfenv'),
appEnv = cfenv.getAppEnv(),
cors = require('cors'),
mongo = require('mongodb').MongoClient,
mongoose = require('mongoose'),
config = require('./config'),
api = require(`./apis/routes/api`)(app, express);
path     = require('path');

if(appEnv.isLocal){
    const a = require('dotenv');
    if(a) {
		//console.log(appEnv);
        a.load();
        mongoose.connect(config.db).then(()=>console.log('connected to mongoose'));
        mongo.connect(config.db).then(()=>console.log('connected to mongo' + config.db));
        console.log(appEnv);
    } else {
        console.log("dot env didnt load");
    }
    // Loads .env file into environment
} else {
    console.log("no file");
}
// /******************************** 
//  MongoDB Connection
//  ********************************/

// //Detects environment and connects to appropriate DB
if(!appEnv.isLocal) {
    var mongoDbUrl, mongoDbOptions = {};
    var mongoDbCredentials = appEnv.services["compose-for-mongodb"][0].credentials;
    // console.log(mongoDbCredentials);
    var ca = [new Buffer(mongoDbCredentials.ca_certificate_base64, 'base64')];
    mongoDbUrl = mongoDbCredentials.uri;
    mongoDbOptions = {
      mongos: {
        ssl: true,
        sslValidate: true,
        sslCA: ca,
        poolSize: 1,
        reconnectTries: 1
      }
    };
    console.log("Your MongoDB is running at ", mongoDbUrl);
    mongoose.connect(mongoDbUrl, mongoDbOptions); // connect to our database
}
else{
    // console.log('Unable to connect to MongoDB.');
}

app.enable('trust proxy');
// Use SSL connection provided by Bluemix. No setup required besides redirecting all HTTP requests to HTTPS
if (!appEnv.isLocal) {
    app.use(function (req, res, next) {
        if (req.secure) // returns true is protocol = https
            next();
        else
            res.redirect('https://' + req.headers.host + req.url);
    });
}

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use("/uploads", express.static(__dirname + '/uploads'));
app.use('/', api);



server.listen(appEnv.port, appEnv.bind, (err)=> {
    console.log(`listening on port ${appEnv.port}`);
});
