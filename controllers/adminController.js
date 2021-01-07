var functions = require('../assets/functions/functions');
const jwt = require('jsonwebtoken');
const fs = require('fs')
const path = require('path')
const DefaultInstitutionPicture = require('../models/defaultInstiutionPicturesModel')
const Account = require('../models/accountModel')

const DefaultProfilePictures = require('../models/defaultInstiutionPicturesModel')
const AccountProfilePictures = require('../models/accountPictureModel')
const Activity = require('../models/activityModel')

// Admin
// Accounts search
exports.accountsSearch_get = async (req, res, next) => {
    try {
        const token = req.headers.authorization.split(' ')[1]
        let decoded = jwt.verify(token, process.env.TOKEN_SECRET);
        if(!decoded){return res.status(401).send("Not authorized") }
        if(!decoded._id){return res.status(401).send("Not authorized") }
        const adminId =  decoded._id
        const adminaccount = await Account.findOne({"_id": adminId});
        if(!adminaccount){return res.status(401).send("Admin not found. Please contact an administrator") }
        let role = adminaccount.role 
        if(role!="admin"&&role!="superAdmin"){return res.status(401).send("Admin not found. Please contact an administrator") }

        const disabledByUser = req.query.disabledByUser
        const disabledByAdmin = req.query.disabledByAdmin
        const verifiedEmail = req.query.verifiedEmail
        const superAdmin = req.query.superAdmin
        const admin = req.query.admin
        const reviewer = req.query.reviewer
        const member = req.query.member

        let filter = {}
        if(disabledByUser=="true"){filter = {...filter, disabledByUser : true}}
        if(disabledByUser=="false"){filter = {...filter, disabledByUser : false}}
        
        if(disabledByAdmin=="true"){filter = {...filter, disabledByAdmin : true}}
        if(disabledByAdmin=="false"){filter = {...filter, disabledByAdmin : false}}
        
        if(verifiedEmail=="true"){filter = {...filter, verifiedEmail : true}}
        if(verifiedEmail=="false"){filter = {...filter, verifiedEmail : false}}
        
        let roleFilter = {$or : []}
        if(superAdmin=="true"){roleFilter.$or.push({ role: "superAdmin" })}
        if(admin=="true"){roleFilter.$or.push({ role: "admin" })}
        if(reviewer=="true"){roleFilter.$or.push({ role: "reviewer" })}
        if(member=="true"){roleFilter.$or.push({ role: "member" })}
        filter = { ...filter, ...roleFilter }
        
        const accounts = await Account.find(filter);
        
        let returnedAccounts = []

        for(let index in accounts){
            let account = accounts[index]

            let profilePictureId = account.profilePictureId
            let profilePicture
            if(!profilePictureId){
                defaultProfilePictureId = account.defaultProfilePictureId
                profilePicture = await DefaultProfilePictures.findById(defaultProfilePictureId)
            } else{
                profilePicture = await AccountProfilePictures.findById(profilePictureId)
            }
            accounts[index] = { 
                ...accounts[index]._doc, 
                profilePicture : profilePicture,
            }

        }
        res.send(accounts)

    } catch(err) {
        return res.status(401).send(err.message)
    }
};


// Admin
// Accounts search
exports.accountAdminEdit_post = async (req, res, next) => {
    try {
        const token = req.headers.authorization.split(' ')[1]
        let decoded = jwt.verify(token, process.env.TOKEN_SECRET);
        if(!decoded){return res.status(401).send("Not authorized") }
        if(!decoded._id){return res.status(401).send("Not authorized") }
        const adminId =  decoded._id
        const adminaccount = await Account.findOne({"_id": adminId});
        if(!adminaccount){return res.status(401).send("Admin not found. Please contact an administrator") }
        let role = adminaccount.role 
        if(role!="admin"&&role!="superAdmin"){return res.status(401).send("Admin not found. Please contact an administrator") }

        const userId = req.body.userId
        const disabledByAdmin = req.body.disabledByAdmin
        const userRole = req.body.role

        const account = await Account.findOne({_id : userId});
        if(userRole){
            if(adminId==userId){return res.status(401).send("un administrateur ne peut pas se changer lui même son role")}
            if(userRole!="member"&&userRole!="reviewer"&&userRole!="admin"){return res.status(401).send("le role n'est pas valide")}
            account.role = userRole
        }
        if(disabledByAdmin!=undefined){
            if(adminId==userId){return res.status(401).send("un administrateur ne peut pas se changer lui même l'état d'accès de son propre compte. Il faut drait se connecter en tant que membre et utiliser le champs disabledbyuser")}
            account.disabledByAdmin = disabledByAdmin
        }
        
        account.save(function (err) {
            if (err) {return next(err)}
        }); 

        res.send(account)

    } catch(err) {
        return res.status(401).send(err.message)
    }
};


exports.accountAdminDelete_post = async (req, res, next) => {
    try {
        const token = req.headers.authorization.split(' ')[1]
        let decoded = jwt.verify(token, process.env.TOKEN_SECRET);
        if(!decoded){return res.status(401).send("Not authorized") }
        if(!decoded._id){return res.status(401).send("Not authorized") }
        const adminId =  decoded._id
        const adminaccount = await Account.findOne({"_id": adminId});
        if(!adminaccount){return res.status(401).send("Admin not found. Please contact an administrator") }
        let role = adminaccount.role 
        if(role!="admin"&&role!="superAdmin"){return res.status(401).send("Admin not found. Please contact an administrator") }

        const userId = req.body.userId
        if(adminId==userId){return res.status(401).send("un administrateur ne peut pas supprimer soi-même son compte")}
        Account.findByIdAndDelete(userId, function (err) {
            if(err) console.log(err);
            console.log("Successful deletion");
          });

        res.status(200).send("Successful deletion")

    } catch(err) {
        return res.status(401).send(err.message)
    }
};

exports.uploadProfilePic = async (req, res, next) => {
    
    try {
        const token = req.headers.authorization.split(' ')[1]
        let decoded = jwt.verify(token, process.env.TOKEN_SECRET);
        if(!decoded){return res.status(401).send("Not authorized") }
        if(!decoded._id){return res.status(401).send("Not authorized") }
        const adminId =  decoded._id
        const adminaccount = await Account.findOne({"_id": adminId});
        if(!adminaccount){return res.status(401).send("Admin not found. Please contact an administrator") }
        let role = adminaccount.role 
        if(role!="admin"&&role!="superAdmin"){return res.status(401).send("Admin not found. Please contact an administrator") }

            if(req.file.size <= 1000000) {
                // return res.status(400).send('File too heavy. Please choose an other file.');

                let newImage = new DefaultInstitutionPicture()

                newImage.img = fs.readFileSync(req.file.path)
                newImage.contentType = 'image/jpeg';
                newImage.save(function(err){
                    if(err){return res.status(400).send(err.message)}
                })
            }
        
        res.status(200).send('Image uploaded');

    
    } catch(err) {return res.status(401).send(err.message)}

}


// Activity
exports.allActivityFetch_get = async (req, res, next) => {
    try {
        const token = req.headers.authorization.split(' ')[1]
        let decoded = jwt.verify(token, process.env.TOKEN_SECRET);
        if(!decoded){return res.status(401).send("Not authorized") }
        if(!decoded._id){return res.status(401).send("Not authorized") }
        const adminId =  decoded._id
        const adminaccount = await Account.findOne({"_id": adminId});
        if(!adminaccount){return res.status(401).send("Admin not found. Please contact an administrator") }
        let role = adminaccount.role 
        if(role!="admin"&&role!="superAdmin"){return res.status(401).send("Admin not found. Please contact an administrator") }

        const activity = await Activity.find();
        
        res.send(activity)

    } catch(err) {
        return res.status(401).send(err.message)
    }
};

exports.activityDelete_post = async (req, res, next) => {
    try {
        console.log("try delete activity")
        const token = req.headers.authorization.split(' ')[1]
        let decoded = jwt.verify(token, process.env.TOKEN_SECRET);
        if(!decoded){return res.status(401).send("Not authorized") }
        if(!decoded._id){return res.status(401).send("Not authorized") }
        const adminId =  decoded._id
        const adminaccount = await Account.findOne({"_id": adminId});
        if(!adminaccount){return res.status(401).send("Admin not found. Please contact an administrator") }
        let role = adminaccount.role 
        if(role!="admin"&&role!="superAdmin"){return res.status(401).send("Admin not found. Please contact an administrator") }

        const activityId = req.body.activityId
        if(!activityId){return res.status(401).send("Activity not found. Please contact an administrator") }

        Activity.findByIdAndDelete(activityId, function (err) {
            if(err) console.log(err);
            console.log("Successful deletion");
          });

        res.status(200).send("Successful deletion")

    } catch(err) {
        return res.status(401).send(err.message)
    }
};
