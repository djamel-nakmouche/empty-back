const jwt = require('jsonwebtoken');

const Person = require('../models/personProfileModel')
const Activity = require('../models/activityModel')

const functions =  require('../assets/functions/functions') 
var geoip = require('geoip-lite');

// INSTITUTION
// ADD NEW
exports.onNavigation_post = async (req, res, next) => {
    try {
        console.log("on nav start")
        let token = req.body.token
        if(token){
            let decoded = jwt.verify(token, process.env.TOKEN_SECRET);
            let userId = decoded._id
            console.log("id token", userId)
        }
        console.log("id sent", req.body.userId)
        // if(!decoded){return res.status(401).send("Not authorized") }
        // if(!decoded._id){return res.status(401).send("Not authorized") }
        if(req.body.nav){
            let ip 
            ip= req.headers['x-forwarded-for']
            if(!ip){ip = req.connection.remoteAddress}
            if(!ip){ip = req.ip}
    
            let geo = geoip.lookup(ip)
            
            var activity = new Activity({
                userId : req.body.userId ? req.body.userId : null,
                IPAddress : ip,
                geoIP : geo,
                operation : req.body.nav,
            })
    
            activity.save(function (err) {
                if (err) { next(); }
            })
        }

        res.send("ok")

    } catch(err) {
        return res.status(401).send(err.message)
    }
};

