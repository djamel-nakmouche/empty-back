const jwt = require('jsonwebtoken');

const Account = require('../models/accountModel')
const Institution = require('../models/institutionModel')
const Role = require('../models/roleModel')
const Person = require('../models/personProfileModel')
const Experience = require('../models/experienceModel')
const PersonProfilePicture = require('../models/personProfilePictureModel')
const PersonComments = require('../models/personComments')

// Reviewer
// Accounts search
exports.fetchInstitutionsPendingValidation_get = async (req, res, next) => {
    try {
        const token = req.headers.authorization.split(' ')[1]
        let decoded = jwt.verify(token, process.env.TOKEN_SECRET);
        if(!decoded){return res.status(401).send("Not authorized") }
        if(!decoded._id){return res.status(401).send("Not authorized") }
        const reviewerId =  decoded._id
        const revieweraccount = await Account.findOne({"_id": reviewerId});
        if(!revieweraccount){return res.status(401).send("Admin not found. Please contact an administrator") }
        let role = revieweraccount.role 
        if(role!="admin"&&role!="superAdmin"&&role!="reviewer"){return res.status(401).send("Reviewer not found. Please contact an administrator") }
        console.log('ok')
        const institutions = await Institution.find({adminValidation : "pending"});

        res.status(200).send(institutions)

    } catch(err) {
        return res.status(401).send(err.message)
    }
};

exports.acceptedInstitutionPendingValidation_post = async (req, res, next) => {
    try {
        const token = req.headers.authorization.split(' ')[1]
        let decoded = jwt.verify(token, process.env.TOKEN_SECRET);
        if(!decoded){return res.status(401).send("Not authorized") }
        if(!decoded._id){return res.status(401).send("Not authorized") }
        const reviewerId =  decoded._id
        const revieweraccount = await Account.findOne({"_id": reviewerId});
        if(!revieweraccount){return res.status(401).send("Admin not found. Please contact an administrator") }
        let role = revieweraccount.role 
        if(role!="admin"&&role!="superAdmin"&&role!="reviewer"){return res.status(401).send("Reviewer not found. Please contact an administrator") }

        const institutionId = req.body.institutionId
        if(!institutionId){return res.status(401).send("No ID found") }

        let institution = await Institution.findOne({_id : institutionId});
        
        if(!institution){return res.status(401).send("Institution not found") }
        institution.adminValidation = "accepted"

        institution.save(function (err) {

            if (err) {return next(err)}

        }); 
        res.status(200).send(institution)

    } catch(err) {
        return res.status(401).send(err.message)
    }
};

exports.declinedInstitutionPendingValidation_post = async (req, res, next) => {
    try {
        const token = req.headers.authorization.split(' ')[1]
        let decoded = jwt.verify(token, process.env.TOKEN_SECRET);
        if(!decoded){return res.status(401).send("Not authorized") }
        if(!decoded._id){return res.status(401).send("Not authorized") }
        const reviewerId =  decoded._id
        const revieweraccount = await Account.findOne({"_id": reviewerId});
        if(!revieweraccount){return res.status(401).send("Admin not found. Please contact an administrator") }
        let role = revieweraccount.role 
        if(role!="admin"&&role!="superAdmin"&&role!="reviewer"){return res.status(401).send("Reviewer not found. Please contact an administrator") }

        const institutionId = req.body.institutionId
        if(!institutionId){return res.status(401).send("No ID found") }

        const institution = await Institution.findOne({_id : institutionId});
        if(!institution){return res.status(401).send("Institution not found") }

        institution.adminValidation = "declined"
        
        institution.save(function (err) {
            if (err) {return next(err)}
        }); 

        res.status(200).send(institution)

    } catch(err) {
        return res.status(401).send(err.message)
    }
};




exports.deleteInstitution_post = async (req, res, next) => {
    try {
        const token = req.headers.authorization.split(' ')[1]
        let decoded = jwt.verify(token, process.env.TOKEN_SECRET);
        if(!decoded){return res.status(401).send("Not authorized") }
        if(!decoded._id){return res.status(401).send("Not authorized") }
        const reviewerId =  decoded._id
        const revieweraccount = await Account.findOne({"_id": reviewerId});
        if(!revieweraccount){return res.status(401).send("Admin not found. Please contact an administrator") }
        let role = revieweraccount.role 
        if(role!="admin"&&role!="superAdmin"&&role!="reviewer"){return res.status(401).send("Reviewer not found. Please contact an administrator") }

        const institutionId = req.body.institutionId
        if(!institutionId){return res.status(401).send("No ID found") }

        await Experience.deleteMany({ institutionId: institutionId });
        await Role.deleteMany({ institutionId: institutionId });


        Institution.findByIdAndDelete(institutionId, function (err) {
            if(err) console.log(err);
            console.log("Successful deletion");
          });

        res.status(200).send("Successful deletion")

    } catch(err) {
        return res.status(401).send(err.message)
    }
};



exports.editInstitution_post = async (req, res, next) => {
    try {
        const token = req.headers.authorization.split(' ')[1]
        let decoded = jwt.verify(token, process.env.TOKEN_SECRET);
        if(!decoded){return res.status(401).send("Not authorized") }
        if(!decoded._id){return res.status(401).send("Not authorized") }
        const reviewerId =  decoded._id
        const revieweraccount = await Account.findOne({"_id": reviewerId});
        if(!revieweraccount){return res.status(401).send("Admin not found. Please contact an administrator") }
        let role = revieweraccount.role 
        if(role!="admin"&&role!="superAdmin"&&role!="reviewer"){return res.status(401).send("Reviewer not found. Please contact an administrator") }

        const institutionId = req.body.institutionId
        if(!institutionId){return res.status(401).send("No ID found") }

        const institution = await Institution.findOne({_id : institutionId});
        if(!institution){return res.status(401).send("Institution not found") }

        const name = req.body.name
        if(name!=undefined){institution.name = name}

        const public = req.body.public
        if(public!=undefined){institution.public = public}

        const recurrence = req.body.recurrence
        if(recurrence!=undefined){institution.recurrence = recurrence}

        const miniDescription = req.body.miniDescription
        if(miniDescription!=undefined){institution.miniDescription = miniDescription}

        institution.save(function (err) {
            if (err) {return next(err)}
        }); 

        res.status(200).send("ok baby")

    } catch(err) {
        return res.status(401).send(err.message)
    }
};






exports.acceptRolePendingVal_post = async (req, res, next) => {
    try {
        const token = req.headers.authorization.split(' ')[1]
        let decoded = jwt.verify(token, process.env.TOKEN_SECRET);
        if(!decoded){return res.status(401).send("Not authorized") }
        if(!decoded._id){return res.status(401).send("Not authorized") }
        const reviewerId =  decoded._id
        const revieweraccount = await Account.findOne({"_id": reviewerId});
        if(!revieweraccount){return res.status(401).send("Admin not found. Please contact an administrator") }
        let userRole = revieweraccount.role 
        if(userRole!="admin"&&userRole!="superAdmin"&&userRole!="reviewer"){return res.status(401).send("Reviewer not found. Please contact an administrator") }

        const roleId = req.body.roleId
        if(!roleId){return res.status(401).send("l'ID du rôle doit être envoyé") }

        let role = await Role.findOne({_id : roleId});
        if(!role){return res.status(401).send("Role not found") }
        role.adminValidation = "accepted"

        role.save(function (err) {
            if (err) {return next(err)}
        }); 
        res.status(200).send(role)

    } catch(err) {
        return res.status(401).send(err.message)
    }
};


exports.declineRolePendingVal_post = async (req, res, next) => {
    try {
        const token = req.headers.authorization.split(' ')[1]
        let decoded = jwt.verify(token, process.env.TOKEN_SECRET);
        if(!decoded){return res.status(401).send("Not authorized") }
        if(!decoded._id){return res.status(401).send("Not authorized") }
        const reviewerId =  decoded._id
        const revieweraccount = await Account.findOne({"_id": reviewerId});
        if(!revieweraccount){return res.status(401).send("Admin not found. Please contact an administrator") }
        let userRole = revieweraccount.role 
        if(userRole!="admin"&&userRole!="superAdmin"&&userRole!="reviewer"){return res.status(401).send("Reviewer not found. Please contact an administrator") }

        const roleId = req.body.roleId
        if(!roleId){return res.status(401).send("l'ID du rôle doit être envoyé") }

        let role = await Role.findOne({_id : roleId});
        if(!role){return res.status(401).send("Role not found") }
        role.adminValidation = "declined"

        role.save(function (err) {
            if (err) {return next(err)}
        }); 
        res.status(200).send(role)

    } catch(err) {
        return res.status(401).send(err.message)
    }
};


exports.deleteRole_post = async (req, res, next) => {
    try {
        const token = req.headers.authorization.split(' ')[1]
        let decoded = jwt.verify(token, process.env.TOKEN_SECRET);
        if(!decoded){return res.status(401).send("Not authorized") }
        if(!decoded._id){return res.status(401).send("Not authorized") }
        const reviewerId =  decoded._id
        const revieweraccount = await Account.findOne({"_id": reviewerId});
        if(!revieweraccount){return res.status(401).send("Admin not found. Please contact an administrator") }
        let userRole = revieweraccount.role 
        if(userRole!="admin"&&userRole!="superAdmin"&&userRole!="reviewer"){return res.status(401).send("Reviewer not found. Please contact an administrator") }

        const roleId = req.body.roleId
        if(!roleId){return res.status(401).send("No ID found") }
        
        await Experience.deleteMany({ roleId: roleId });

        Role.findByIdAndDelete(roleId, function (err) {
            if(err) console.log(err);
            console.log("Successful deletion");
          });

        res.status(200).send("Successful deletion")

    } catch(err) {
        return res.status(401).send(err.message)
    }
};



exports.editRole_post = async (req, res, next) => {
    try {
        const token = req.headers.authorization.split(' ')[1]
        let decoded = jwt.verify(token, process.env.TOKEN_SECRET);
        if(!decoded){return res.status(401).send("Not authorized") }
        if(!decoded._id){return res.status(401).send("Not authorized") }
        const reviewerId =  decoded._id
        const revieweraccount = await Account.findOne({"_id": reviewerId});
        if(!revieweraccount){return res.status(401).send("Admin not found. Please contact an administrator") }
        let userRole = revieweraccount.role 
        if(userRole!="admin"&&userRole!="superAdmin"&&userRole!="reviewer"){return res.status(401).send("Reviewer not found. Please contact an administrator") }

        const roleId = req.body.roleId
        if(!roleId){return res.status(401).send("No ID found") }

        const role = await Role.findOne({_id : roleId});
        if(!role){return res.status(401).send("Role not found") }

        const name = req.body.name
        if(name!=undefined){ role.name = name }

        const miniDescription = req.body.miniDescription
        if(miniDescription!=undefined){role.miniDescription = miniDescription}

        role.save(function (err) {
            if (err) {return next(err)}
        }); 

        res.status(200).send("Operation OK")

    } catch(err) {
        return res.status(401).send(err.message)
    }
};






exports.acceptPersonPendingVal_post = async (req, res, next) => {
    try {
        const token = req.headers.authorization.split(' ')[1]
        let decoded = jwt.verify(token, process.env.TOKEN_SECRET);
        if(!decoded){return res.status(401).send("Not authorized") }
        if(!decoded._id){return res.status(401).send("Not authorized") }
        const reviewerId =  decoded._id
        const revieweraccount = await Account.findOne({"_id": reviewerId});
        if(!revieweraccount){return res.status(401).send("Admin not found. Please contact an administrator") }
        let userRole = revieweraccount.role 
        if(userRole!="admin"&&userRole!="superAdmin"&&userRole!="reviewer"){return res.status(401).send("Reviewer not found. Please contact an administrator") }

        const personId = req.body.personId
        if(!personId){return res.status(401).send("l'ID de la personne doit être envoyé") }

        let person = await Person.findOne({_id : personId});
        if(!person){return res.status(401).send("Person not found") }
        person.adminValidation = "accepted"

        person.save(function (err) {
            if (err) {return next(err)}
        }); 
        res.status(200).send(person)

    } catch(err) {
        return res.status(401).send(err.message)
    }
};

exports.declinePersonPendingVal_post = async (req, res, next) => {
    try {
        const token = req.headers.authorization.split(' ')[1]
        let decoded = jwt.verify(token, process.env.TOKEN_SECRET);
        if(!decoded){return res.status(401).send("Not authorized") }
        if(!decoded._id){return res.status(401).send("Not authorized") }
        const reviewerId =  decoded._id
        const revieweraccount = await Account.findOne({"_id": reviewerId});
        if(!revieweraccount){return res.status(401).send("Admin not found. Please contact an administrator") }
        let userRole = revieweraccount.role 
        if(userRole!="admin"&&userRole!="superAdmin"&&userRole!="reviewer"){return res.status(401).send("Reviewer not found. Please contact an administrator") }

        const personId = req.body.personId
        if(!personId){return res.status(401).send("l'ID de la personne doit être envoyé") }

        let person = await Person.findOne({_id : personId});
        if(!person){return res.status(401).send("Person not found") }
        person.adminValidation = "declined"

        person.save(function (err) {
            if (err) {return next(err)}
        }); 
        res.status(200).send(person)

    } catch(err) {
        return res.status(401).send(err.message)
    }
};


exports.deletePerson_post = async (req, res, next) => {
    try {
        const token = req.headers.authorization.split(' ')[1]
        let decoded = jwt.verify(token, process.env.TOKEN_SECRET);
        if(!decoded){return res.status(401).send("Not authorized") }
        if(!decoded._id){return res.status(401).send("Not authorized") }
        const reviewerId =  decoded._id
        const revieweraccount = await Account.findOne({"_id": reviewerId});
        if(!revieweraccount){return res.status(401).send("Admin not found. Please contact an administrator") }
        let userRole = revieweraccount.role 
        if(userRole!="admin"&&userRole!="superAdmin"&&userRole!="reviewer"){return res.status(401).send("Reviewer not found. Please contact an administrator") }
        
        const personId = req.body.personId
        if(!personId){return res.status(401).send("l'ID de la personne doit être envoyé") }

        await Experience.deleteMany({ personId: personId });

        Person.findByIdAndDelete(personId, function (err) {
            if(err) console.log(err);
            console.log("Successful deletion");
          });

        res.status(200).send("Successful deletion")

    } catch(err) {
        return res.status(401).send(err.message)
    }
};



exports.editPerson_post = async (req, res, next) => {
    try {
        const token = req.headers.authorization.split(' ')[1]
        let decoded = jwt.verify(token, process.env.TOKEN_SECRET);
        if(!decoded){return res.status(401).send("Not authorized") }
        if(!decoded._id){return res.status(401).send("Not authorized") }
        const reviewerId =  decoded._id
        const revieweraccount = await Account.findOne({"_id": reviewerId});
        if(!revieweraccount){return res.status(401).send("Admin not found. Please contact an administrator") }
        let userRole = revieweraccount.role 
        if(userRole!="admin"&&userRole!="superAdmin"&&userRole!="reviewer"){return res.status(401).send("Reviewer not found. Please contact an administrator") }

        const personId = req.body.personId
        if(!personId){return res.status(401).send("l'ID de la personne doit être envoyé") }

        const person = await Person.findOne({_id : personId});
        if(!person){return res.status(401).send("Person not found") }

        const firstName = req.body.firstName
        if(firstName!=undefined){person.firstName = firstName}
        const lastName = req.body.lastName
        if(lastName!=undefined){person.lastName = lastName}
        const dateOfBirth = req.body.dateOfBirth
        if(dateOfBirth!=undefined){person.dateOfBirth = dateOfBirth}
        const gender = req.body.gender
        if(gender!=undefined){person.gender = gender}
        
        const wilayaOfBirth = req.body.wilayaOfBirth
        if(wilayaOfBirth!=undefined){person.wilayaOfBirth = wilayaOfBirth}
        
        const miniBio = req.body.miniBio
        if(miniBio!=undefined){person.miniBio = miniBio}

        person.save(function (err) {
            if (err) {return next(err)}
        }); 
        res.status(200).send("ok")


    } catch(err) {
        return res.status(401).send(err.message)
    }
};


exports.deletePersonProfilePicture_post = async (req, res, next) => {
    try {
        const token = req.headers.authorization.split(' ')[1]
        let decoded = jwt.verify(token, process.env.TOKEN_SECRET);
        if(!decoded){return res.status(401).send("Not authorized") }
        if(!decoded._id){return res.status(401).send("Not authorized") }
        const reviewerId =  decoded._id
        const revieweraccount = await Account.findOne({"_id": reviewerId});
        if(!revieweraccount){return res.status(401).send("Admin not found. Please contact an administrator") }
        let userRole = revieweraccount.role 
        if(userRole!="admin"&&userRole!="superAdmin"&&userRole!="reviewer"){return res.status(401).send("Reviewer not found. Please contact an administrator") }
        console.log("req.body", req.body)
        const personId = req.body.personId
        if(!personId){return res.status(401).send("l'ID de la personne doit être envoyé") }
        
        const person = await Person.findOne({_id : personId});
        if(!person){return res.status(401).send("Person not found") }
        
        
        person.profilePictureId = null
        person.save(function (err) {
            if (err) {return next(err)}
        }); 
        res.status(200).send("Successful deletion")

    } catch(err) {
        return res.status(401).send(err.message)
    }
};
// EXPERIENCE




exports.acceptExperiencePendingVal_post = async (req, res, next) => {
    try {
        const token = req.headers.authorization.split(' ')[1]
        let decoded = jwt.verify(token, process.env.TOKEN_SECRET);
        if(!decoded){return res.status(401).send("Not authorized") }
        if(!decoded._id){return res.status(401).send("Not authorized") }
        const reviewerId =  decoded._id
        const revieweraccount = await Account.findOne({"_id": reviewerId});
        if(!revieweraccount){return res.status(401).send("Admin not found. Please contact an administrator") }
        let userRole = revieweraccount.role 
        if(userRole!="admin"&&userRole!="superAdmin"&&userRole!="reviewer"){return res.status(401).send("Reviewer not found. Please contact an administrator") }

        const experienceId = req.body.experienceId
        if(!experienceId){return res.status(401).send("l'ID de l'experiencene doit être envoyé") }

        let experience = await Experience.findOne({_id : experienceId});
        if(!experience){return res.status(401).send("Experience not found") }
        experience.adminValidation = "accepted"

        experience.save(function (err) {
            if (err) {return next(err)}
        }); 
        res.status(200).send(experience)

    } catch(err) {
        return res.status(401).send(err.message)
    }
};



exports.declineExperiencePendingVal_post = async (req, res, next) => {
    try {
        const token = req.headers.authorization.split(' ')[1]
        let decoded = jwt.verify(token, process.env.TOKEN_SECRET);
        if(!decoded){return res.status(401).send("Not authorized") }
        if(!decoded._id){return res.status(401).send("Not authorized") }
        const reviewerId =  decoded._id
        const revieweraccount = await Account.findOne({"_id": reviewerId});
        if(!revieweraccount){return res.status(401).send("Admin not found. Please contact an administrator") }
        let userRole = revieweraccount.role 
        if(userRole!="admin"&&userRole!="superAdmin"&&userRole!="reviewer"){return res.status(401).send("Reviewer not found. Please contact an administrator") }

        const experienceId = req.body.experienceId
        if(!experienceId){return res.status(401).send("l'ID de l'experiencene doit être envoyé") }

        let experience = await Experience.findOne({_id : experienceId});
        if(!experience){return res.status(401).send("Experience not found") }
        experience.adminValidation = "declined"

        experience.save(function (err) {
            if (err) {return next(err)}
        }); 
        res.status(200).send(experience)

    } catch(err) {
        return res.status(401).send(err.message)
    }
};

exports.deleteExperience_post = async (req, res, next) => {
    try {
        const token = req.headers.authorization.split(' ')[1]
        let decoded = jwt.verify(token, process.env.TOKEN_SECRET);
        if(!decoded){return res.status(401).send("Not authorized") }
        if(!decoded._id){return res.status(401).send("Not authorized") }
        const reviewerId =  decoded._id
        const revieweraccount = await Account.findOne({"_id": reviewerId});
        if(!revieweraccount){return res.status(401).send("Admin not found. Please contact an administrator") }
        let userRole = revieweraccount.role 
        if(userRole!="admin"&&userRole!="superAdmin"&&userRole!="reviewer"){return res.status(401).send("Reviewer not found. Please contact an administrator") }

        const experienceId = req.body.experienceId
        if(!experienceId){return res.status(401).send("l'ID de l'experiencene doit être envoyé") }

        Experience.findByIdAndDelete(experienceId, function (err) {
            if(err) console.log(err);
            console.log("Successful deletion");
          });

        res.status(200).send("Successful deletion")

    } catch(err) {
        return res.status(401).send(err.message)
    }
};



// - DELETE
exports.personCommentDelete_post = async (req, res, next) => {
    try {
        const token = req.headers.authorization.split(' ')[1]
        let decoded = jwt.verify(token, process.env.TOKEN_SECRET);
        if(!decoded){return res.status(401).send("Not authorized") }
        if(!decoded._id){return res.status(401).send("Not authorized") }
        const reviewerId =  decoded._id
        const revieweraccount = await Account.findOne({"_id": reviewerId});
        if(!revieweraccount){return res.status(401).send("Admin not found. Please contact an administrator") }
        let userRole = revieweraccount.role 
        if(userRole!="admin"&&userRole!="superAdmin"&&userRole!="reviewer"){return res.status(401).send("Reviewer not found. Please contact an administrator") }
       
        const commentId = req.body.commentId
        if(!commentId){return res.status(401).send("CommentId not found") }
        const comment = await PersonComments.findOne({_id : commentId});
        if(!comment){return res.status(401).send("comment not found") }
        
        PersonComments.findByIdAndDelete(commentId, function (err) {
            if(err) console.log(err);
            console.log("Successful deletion");
          });

        res.status(200).send("Successful deletion")
        
    } catch(err) {
        return res.status(401).send(err.message)
    }
};



