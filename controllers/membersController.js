const jwt = require('jsonwebtoken');

const Person = require('../models/personProfileModel')
const Institution = require('../models/institutionModel')
const Role = require('../models/roleModel')
const Experience = require('../models/experienceModel')
const DefaultProfilePictures = require('../models/defaultProfilePicturesModel')
const PersonProfilePictures = require('../models/personProfilePictureModel')
const PersonVotes = require('../models/personProfileVoteModel')
const PersonComments = require('../models/personComments')
const PersonCommentLikes = require('../models/personCommentLikeModel')

const functions =  require('../assets/functions/functions') 
const fs = require('fs')

// INSTITUTION
// ADD NEW
exports.institutionAddNew_post = async (req, res, next) => {
    try {
        const token = req.headers.authorization.split(' ')[1]
        let decoded = jwt.verify(token, process.env.TOKEN_SECRET);
        if(!decoded){return res.status(401).send("Not authorized") }
        if(!decoded._id){return res.status(401).send("Not authorized") }
        
        const newInstitutionObject = req.body
        var newInstitution = new Institution();
        newInstitution.name = newInstitutionObject.name
        newInstitution.public = newInstitutionObject.public
        newInstitution.recurrence = newInstitutionObject.recurrence
        newInstitution.miniDescription = newInstitutionObject.miniDescription
        newInstitution.addedBy = decoded._id
        
        newInstitution.save(function (err) {
            if (err) {return next(err)}
        }); 
        operation = `created ${newInstitution._id}` 
        
        res.send(operation)

    } catch(err) {
        return res.status(401).send(err.message)
    }
};



// ROLE
// ADD NEW
exports.roleAddNew_post = async (req, res, next) => {
    try {

        const token = req.headers.authorization.split(' ')[1]
        let decoded = jwt.verify(token, process.env.TOKEN_SECRET);
        if(!decoded){return res.status(401).send("Not authorized") }
        if(!decoded._id){return res.status(401).send("Not authorized") }
        
        const institutionId = req.body.institutionId
        if(!institutionId){return res.status(401).send("No ID found") }

        const institution = await Institution.findOne({_id : institutionId});
        if(!institution){return res.status(401).send("Institution not found") }

        const name = req.body.name
        if(!name){return res.status(401).send("Le nom du rôle est un champs obligatoire") }


        var newRole = new Role();
        newRole.name = name
        newRole.institutionId = institutionId
        if(req.body.miniDescription!=undefined){newRole.miniDescription = req.body.miniDescription}
        newRole.addedBy = decoded._id

        newRole.save(function (err) {
            if (err) {return next(err)}
        }); 
        operation = `created ${newRole._id}` 
        
        res.status(200).send(operation)

    } catch(err) {
        return res.status(401).send(err.message)
    }
};


// PERSON PROFILE 
// - ADD NEW
exports.personProfileAddNew_post = async (req, res, next) => {
    try {

        const token = req.headers.authorization.split(' ')[1]
        let decoded = jwt.verify(token, process.env.TOKEN_SECRET);
        if(!decoded){return res.status(401).send("Not authorized") }
        if(!decoded._id){return res.status(401).send("Not authorized") }
        

        const newPersonObject = req.body
        var newPerson = new Person();
        newPerson.firstName = newPersonObject.firstName
        newPerson.lastName = newPersonObject.lastName

        newPerson.dateOfBirth = newPersonObject.dateOfBirth
        newPerson.wilayaOfBirth = newPersonObject.wilayaOfBirth

        
        newPerson.gender = newPersonObject.gender
        newPerson.miniBio= newPersonObject.miniBio
        newPerson.addedBy = decoded._id
        
        let defaultProfilePictures = await DefaultProfilePictures.find({});

        newPerson.defaultProfilePictureId= defaultProfilePictures[functions.getRandomInt(defaultProfilePictures.length)]._id       

        newPerson.save(function (err) {
            if (err) {return next(err)}
        }); 
        operation = `created ${newPerson._id}` 
        console.log(operation)
        res.status(200).send({_id : newPerson._id})

    } catch(err) {
        return res.status(401).send(err.message)
    }
};



exports.personProfileAddProfilePicture_post = async (req, res, next) => {
    try {
        console.log("personProfileAddProfilePicture_post")
        const token = req.headers.authorization.split(' ')[1]
        let decoded = jwt.verify(token, process.env.TOKEN_SECRET);
        if(!decoded){return res.status(401).send("Not authorized") }
        if(!decoded._id){return res.status(401).send("Not authorized") }
        
        if(req.body.personId==undefined){return res.status(401).send("An error has occured") }
        let person = await Person.findById(req.body.personId);
        if(!person){return res.status(401).send("Person nott found") }
        console.log("req.file.size",req.file.size)

        // console.log("req.files", req.files)
        if(req.file.size <= 1000000) {
            let newImage = new PersonProfilePictures()
            newImage.img = fs.readFileSync(req.file.path)
            newImage.contentType = 'image/jpeg';
            newImage.addedBy = decoded._id

            newImage.save(function(err){
                console.log("newImage", newImage._id)
                if(err){return res.status(400).send(err.message)}
            })
            person.profilePictureId = newImage._id
            
            person.save(function(err){
                if(err){return res.status(400).send(err.message)}
            })
        }else {
            return res.status(401).send("Too heavy file")
        }
        
        res.status(200).send('Image uploaded');

    
    } catch(err) {return res.status(401).send(err.message)}

}

// - VOTE
exports.personProfileVote_post = async (req, res, next) => {
    try {

        const token = req.headers.authorization.split(' ')[1]
        let decoded = jwt.verify(token, process.env.TOKEN_SECRET);
        if(!decoded){return res.status(401).send("Not authorized") }
        if(!decoded._id){return res.status(401).send("Not authorized") }
        
        let personId = req.body.personId
        if(!personId){return res.status(401).send("An error occured") }

        let person = await Person.findById(personId)
        if(!person){return res.status(401).send("An error occured") }

        let liked = req.body.liked
        let disliked = req.body.disliked
        console.log("liked", liked)
        console.log("disliked", disliked)

        let voteDocument = await PersonVotes.findOne({personId : personId, accountId : decoded._id})
        
        if(voteDocument){ //Déjà voté pour cette personne

            if(liked){
                voteDocument.type=true
            }else if(disliked){
                voteDocument.type=false

            } else {
                voteDocument.type=null
            }
        
        }else{ //jamais voté pour cette personne

            voteDocument = new PersonVotes();
            voteDocument.personId = personId
            voteDocument.accountId = decoded._id
            
            if(liked==true){
                voteDocument.type=true
            }else if(disliked==true){
                voteDocument.type=false
            }
        }

        voteDocument.save(function (err) {
            if (err) {return next(err)}
        }); 

        operation = `saved document ${voteDocument._id}` 
        
        res.status(200).send(operation)

    } catch(err) {
        return res.status(401).send(err.message)
    }
};







// EXPERIENCE 
// - ADD NEW
exports.experienceAddNew_post = async (req, res, next) => {
    try {
        const token = req.headers.authorization.split(' ')[1]
        let decoded = jwt.verify(token, process.env.TOKEN_SECRET);
        if(!decoded){return res.status(401).send("Not authorized") }
        if(!decoded._id){return res.status(401).send("Not authorized") }
        
        
        const personId = req.body.personId
        if(!personId){return res.status(401).send("personId not found") }
        const person = await Person.findOne({_id : personId});
        if(!person){return res.status(401).send("person not found") }

        const roleId = req.body.roleId
        if(!roleId){return res.status(401).send("roleId not found") }
        const role = await Role.findOne({_id : roleId});
        if(!role){return res.status(401).send("role not found") }

        const institutionId = req.body.institutionId
        if(!institutionId){return res.status(401).send("institutionId not found") }
        const institution = await Institution.findOne({_id : institutionId});
        if(!institution){return res.status(401).send("institution not found") }

        const institutionIdInRole = role.institutionId

        if(institutionIdInRole!=institutionId){return res.status(401).send("institution and role incompatibles") }


        var newExperience = new Experience();

        if(req.body.dateOfStart!=undefined){newExperience.dateOfStart = req.body.dateOfStart}else{
            return res.status(401).send("Date of start is required") 
        }
        if(req.body.ended!=undefined){newExperience.ended = req.body.ended}else{
            return res.status(401).send("ended is required") 
        }
        if(req.body.ended==true){
            if(req.body.dateOfEnd!=undefined){newExperience.dateOfEnd = req.body.dateOfEnd} else {
                return res.status(401).send("date of end is required whene the experience is ended") 
            }
        }

        
        newExperience.addedBy = decoded._id

        newExperience.personId = personId
        newExperience.roleId = role._id
        newExperience.roleName = role.name
        newExperience.institutionId = institution._id
        newExperience.institutionName = institution.name

        newExperience.dateOfStart = req.body.dateOfStart
        newExperience.ended = req.body.ended
        
        newExperience.description = req.body.description
        newExperience.dateOfEnd = req.body.dateOfEnd

        if(req.body.description!=undefined){newExperience.description = req.body.description}
        
        // newExperience.experienceTitle = `${role.name} à ${institution.name}`

        if(req.body.wilaya!=undefined){
            newExperience.wilaya = req.body.wilaya
            // newExperience.experienceTitle = `${role.name} au sein de ${institution.name} de ${req.body.wilaya}`
        }
        if(req.body.daira!=undefined){
            newExperience.daira = req.body.daira
            // newExperience.experienceTitle = `${role.name} au sein de ${institution.name} de ${req.body.daira}`
        }

        if(req.body.commune!=undefined){
            newExperience.commune = req.body.commune
            // newExperience.experienceTitle = `${role.name} au sein de ${institution.name} de ${req.body.commune}`
        }



        newExperience.save(function (err) {
            if (err) {return next(err)}
            let operation = `created ${newExperience._id}` 
        
            res.status(200).send(operation)
        }); 
        

    } catch(err) {
        return res.status(401).send(err.message)
    }
};





// EXPERIENCE 
// - ADD NEW
exports.personCommentAddNew_post = async (req, res, next) => {
    try {
        const token = req.headers.authorization.split(' ')[1]
        let decoded = jwt.verify(token, process.env.TOKEN_SECRET);
        if(!decoded){return res.status(401).send("Not authorized") }
        if(!decoded._id){return res.status(401).send("Not authorized") }
                
        const personId = req.body.personId
        if(!personId){return res.status(401).send("personId not found") }
        const person = await Person.findOne({_id : personId});
        if(!person){return res.status(401).send("person not found") }


        let newComment = new PersonComments();

        newComment.personId = personId
        newComment.accountId = decoded._id
        let comment = req.body.comment
        if(comment==undefined||comment==null||comment==""){return res.status(401).send("Veuillez renseigner un commentaire") }
        newComment.comment = comment

        newComment.save(function (err) {
            if (err) {return next(err)}
            let operation = `created ${newComment._id}` 
            res.status(200).send(operation)
        }); 
        
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
                
        const commentId = req.body.commentId
        if(!commentId){return res.status(401).send("CommentId not found") }
        const comment = await PersonComments.findOne({_id : commentId});
        if(!comment){return res.status(401).send("comment not found") }
        if(comment.accountId!=decoded._id){return res.status(401).send("Not authorized") }

        PersonComments.findByIdAndDelete(commentId, function (err) {
            if(err) console.log(err);
            console.log("Successful deletion");
          });

        res.status(200).send("Successful deletion")
        
    } catch(err) {
        return res.status(401).send(err.message)
    }
};


// - VOTE
exports.personCommentLikeDislike_post = async (req, res, next) => {
    try {
        const token = req.headers.authorization.split(' ')[1]
        let decoded = jwt.verify(token, process.env.TOKEN_SECRET);
        if(!decoded){return res.status(401).send("Not authorized") }
        if(!decoded._id){return res.status(401).send("Not authorized") }
        
        let commentId = req.body.commentId
        if(!commentId){return res.status(401).send("An error occured") }

        let comment = await PersonComments.findById(commentId)
        if(!comment){return res.status(401).send("An error occured") }

        let commentLike = await PersonCommentLikes.findOne({commentId : commentId, accountId : decoded._id})
        
        if(commentLike){
            // Supprimer 
            PersonCommentLikes.findByIdAndDelete(commentLike._id, function (err) {
                if(err) console.log(err);
                console.log("Successful deletion");
              });
            res.status(200).send("Successful deletion")
            
        } else {
            // Ajouter
            newCommentLike = new PersonCommentLikes();
            newCommentLike.commentId = commentId
            newCommentLike.accountId = decoded._id

            newCommentLike.save(function (err) {
                if (err) {return next(err)}
            });
            operation = `saved comment ${newCommentLike._id}` 
            res.status(200).send(operation)
        }

    } catch(err) {
        return res.status(401).send(err.message)
    }
};
