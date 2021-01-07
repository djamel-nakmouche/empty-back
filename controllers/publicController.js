const jwt = require('jsonwebtoken');

const PersonProfile = require('../models/personProfileModel')
const Institution = require('../models/institutionModel')
const Role = require('../models/roleModel')
const Experience = require('../models/experienceModel')
const Account = require('../models/accountModel')
const DefaultProfilePictures = require('../models/defaultProfilePicturesModel')
const PersonProfilePictures = require('../models/personProfilePictureModel')
const DefaultAccountProfilePictures = require('../models/defaultInstiutionPicturesModel')
const AccountProfilePictures = require('../models/accountPictureModel')
const PersonVotes = require('../models/personProfileVoteModel')
const PersonComments = require('../models/personComments')
const PersonCommentLikes = require('../models/personCommentLikeModel')

exports.fetchPersonById_get = async (req, res, next) => {
    try {
        
        const token = req.headers.authorization.split(' ')[1]

        let decoded
        if(token!='null'){
            decoded = jwt.verify(token, process.env.TOKEN_SECRET);
        }
        
        const personId = req.params.personId
        if(personId==undefined){return res.status(401).send("personId not found")}

        let person = await PersonProfile.findById(personId)
        if(person){
            person.viewsCount = person.viewsCount +1
            console.log("person Count", person.viewsCount)
            person.save(function (err) {
                if (err) {return next(err)}
            }); 
        }
        let profilePictureId = person.profilePictureId
        let profilePicture
        if(!profilePictureId){
            defaultProfilePictureId = person.defaultProfilePictureId
            profilePicture = await DefaultProfilePictures.findById(defaultProfilePictureId)
        } else{
            profilePicture = await PersonProfilePictures.findById(profilePictureId)
        }

        
        let experiences = await Experience.find({personId:personId, ended : false}).sort( { dateOfStart : -1} )
        let lastExperienceTitle = ""
        let prefix

        if(experiences.length>0){ prefix = "Actuellement" }
        else {
            experiences = await Experience.find({personId:personId}).sort( { dateOfStart : -1} )
            if(experiences.length>0){ prefix = "Précédemment" }
        }

        if(experiences.length>0){
            let role = await Role.findById(experiences[0].roleId)
            let institution = await Institution.findById(experiences[0].institutionId)

            let recurrence = institution.recurrence

            if(recurrence=="Pays"){
                lastExperienceTitle = `${prefix} ${role.name} à ${institution.name}`
            }else if(recurrence=="Wilaya"){
                lastExperienceTitle = `${prefix} ${role.name} à ${institution.name} de ${experiences[0].wilaya}`
            }else if(recurrence=="Daira"){
                lastExperienceTitle = `${prefix} ${role.name} à ${institution.name} de ${experiences[0].daira}, wilaya de ${experiences[0].wilaya}`
            }else if(recurrence=="Commune"){
                lastExperienceTitle = `${prefix} ${role.name} à ${institution.name} de ${experiences[0].commune}, wilaya de ${experiences[0].wilaya}`
            }
        }
        let member = await Account.findById(person.addedBy)
        let addedByPseudo
        if(member){addedByPseudo=member.pseudo}else{addedByPseudo='inconnu'}

        let voteType
        let voteDoc 

        if(decoded){
            if(decoded._id){
                voteDoc = await PersonVotes.findOne({personId : personId, accountId : decoded._id})

                if(voteDoc){

                    voteType = voteDoc.type
                }
            }
        }

        let liked = voteType == true ? true : false
        let disliked = voteType == false ? true : false
        
        let likesCount = await PersonVotes.countDocuments({personId : personId, type : true})
        let dislikesCount = await PersonVotes.countDocuments({personId : personId, type : false})

        let sentObject = {
            ...person._doc,
            profilePicture : profilePicture,
            lastExperienceTitle : lastExperienceTitle,
            addedByPseudo : addedByPseudo,

            liked : liked,
            disliked : disliked,
            likesCount : likesCount,
            dislikesCount : dislikesCount,
            }

        res.status(200).send(sentObject)

    } catch(err) {
        return res.status(401).send(err.message)
    } 
};


exports.countPersonVisits_post = async (req, res, next) => {
    try {
        const token = req.headers.authorization.split(' ')[1]
        let decoded; if(token!='null'){ decoded = jwt.verify(token, process.env.TOKEN_SECRET)}

        const personId = req.body.personId
        if(personId==undefined){return res.status(401).send("personId not found")}

        let person = await PersonProfile.findById(personId)
        if(person){
            person.viewsCount = person.viewsCount +1
            person.save(function (err) {
                if (err) {return next(err)}
                res.status(200).send("View counted")
            }); 
        }else{return res.status(401).send("person not found")}

    } catch(err) {
        return res.status(401).send(err.message)
    } 
};


exports.fetchCommentsByPersonId_get = async (req, res, next) => {
    try {
        const token = req.headers.authorization.split(' ')[1]
        console.log("Mmmm")
        let decoded
        if(token!='null'){
            decoded = jwt.verify(token, process.env.TOKEN_SECRET);
        }
        
        const personId = req.params.personId
        if(personId==undefined){return res.status(401).send("personId not found")}
        
        let comments = await PersonComments.find({personId : personId})

        for(let index in comments){
            let accountId = comments[index].accountId
            let account = await Account.findById(accountId)
            let profilePicture
            let profilePictureId
            let defaultProfilePictureId
            let pseudo
            let liked = false

            if(account){
                pseudo = account.pseudo
                firstName = account.firstName
                lastName = account.lastName
                profilePictureId = account.profilePictureId
                if(!profilePictureId){
                    defaultProfilePictureId = account.defaultProfilePictureId
                    profilePicture = await DefaultAccountProfilePictures.findById(defaultProfilePictureId)
                } else{
                    profilePicture = await AccountProfilePictures.findById(profilePictureId)
                }
                if(decoded){
                    if(decoded._id){
                        likeDoc = await PersonCommentLikes.findOne({commentId : comments[index]._id, accountId : decoded._id})
                        if(likeDoc){liked = true}
                    }
                }

            }

            let likes = await PersonCommentLikes.countDocuments({commentId : comments[index]._id})


            comments[index] = {
                ...comments[index]._doc,
                authorPseudo : pseudo,
                authorFirstName : firstName,
                authorLastName : lastName,
                authorProfilePicture : profilePicture,
                liked : liked,
                likes : likes
            }
        }
        

        res.status(200).send(comments)

    } catch(err) {
        return res.status(401).send(err.message)
    } 
};

exports.searchPersons_get = async (req, res, next) => {
    try {

        let value = req.query.value

        
        const returnedList = []
        const idResults = []

        if(value!=undefined){
            const searchArray = value.split(' ')
            if(searchArray.length>0){
                for(let i in searchArray){
                    let regex = new RegExp(searchArray[i].normalize("NFD").replace(/[\u0300-\u036f]/g, ""), 'i')
                    
                    let persons_ = await PersonProfile.find({
                        $or: [ 
                            { firstName: regex},
                            { lastName: regex },
                            { miniBio: regex } ,
                        ]
                    })
                    for(let j in persons_){
                        let id = persons_[j]._id
                        if(!idResults.includes(id)){
                            idResults.push(id)
                            returnedList.push(persons_[j])
                        }
                    }
                    if(value.length>2){
                        let experiences_ = await Experience.find({
                            $or: [ 
                                { roleName: regex},
                                { institutionName: regex },
                                { description: regex } ,
                            ]
                        })
                        for(let j in experiences_){
                            let id = experiences_[j].personId
                            if(!idResults.includes(id)){
                                let person = await PersonProfile.findById(id)
                                idResults.push(id)
                                returnedList.push(person)
                            }
                        }
                    }
                    
                }
            }
        }
        
        

        for(let index in returnedList){

            let profilePictureId = returnedList[index].profilePictureId

            let profilePicture
            if(!profilePictureId){
                defaultProfilePictureId = returnedList[index].defaultProfilePictureId
                profilePicture = await DefaultProfilePictures.findById(defaultProfilePictureId)
            } else{
                profilePicture = await PersonProfilePictures.findById(profilePictureId)
            }
            
            let experiences = await Experience.find({personId:returnedList[index]._doc._id, ended : false}).sort( { dateOfStart : -1} )
            let lastExperienceTitle = ""
            let prefix
    
            if(experiences.length>0){ prefix = "Actuellement" }
            else {
                experiences = await Experience.find({personId:returnedList[index]._doc._id}).sort( { dateOfStart : -1} )
                if(experiences.length>0){ prefix = "Précédemment" }
            }
    
            if(experiences.length>0){
                let role = await Role.findById(experiences[0].roleId)
                let institution = await Institution.findById(experiences[0].institutionId)
    
                let recurrence = institution.recurrence
    
                if(recurrence=="Pays"){
                    lastExperienceTitle = `${prefix} ${role.name} à ${institution.name}`
                }else if(recurrence=="Wilaya"){
                    lastExperienceTitle = `${prefix} ${role.name} à ${institution.name} de ${experiences[0].wilaya}`
                }else if(recurrence=="Daira"){
                    lastExperienceTitle = `${prefix} ${role.name} à ${institution.name} de ${experiences[0].daira}, wilaya de ${experiences[0].wilaya}`
                }else if(recurrence=="Commune"){
                    lastExperienceTitle = `${prefix} ${role.name} à ${institution.name} de ${experiences[0].commune}, wilaya de ${experiences[0].wilaya}`
                }
            }

            returnedList[index] = { 
                ...returnedList[index]._doc, 
                profilePicture : profilePicture,
                lastExperienceTitle : lastExperienceTitle,
            }
        }
        res.status(200).send(returnedList)

    } catch(err) {
        return res.status(401).send(err.message)
    }
};


exports.fetchInstitutionById_get = async (req, res, next) => {
    try {
        const institutionId = req.params.institutionId

        if(institutionId==undefined){return res.status(401).send("institutionId not found")}

        let institution = await Institution.findById(institutionId)
        
        let member = await Account.findById(institution.addedBy)
        let addedByPseudo
        if(member){addedByPseudo=member.pseudo}else{addedByPseudo='inconnu'}

        res.status(200).send({
            ...institution._doc,
            addedByPseudo : addedByPseudo,
        })

    } catch(err) {
        return res.status(401).send(err.message)
    } 
};

exports.searchInstitutions_get = async (req, res, next) => {
    try {


        let value = req.query.value
        console.log("search institution value", value)
        
        const returnedList = []
        const idResults = []
        if(value!=undefined){
            const searchArray = value.split(' ')
            console.log(searchArray)
            let institutions = await Institution.find({})
            if(searchArray.length>0){
                for(let i in searchArray){
                    let regex = new RegExp(searchArray[i].normalize("NFD").replace(/[\u0300-\u036f]/g, ""), 'i')
                    for(let index in institutions){

                        const institution = institutions[index]
                        // .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
                        let name = institution.name.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
                        let recurrence = institution.recurrence.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
                        let miniDescription = institution.miniDescription.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
                        
                        if((regex.test(name) || regex.test(recurrence) || regex.test(miniDescription)) && !idResults.includes(institution._id)){
                            idResults.push(institution._id)
                            returnedList.push(institution)
                        }
                    }
                }
            }
        }

        res.status(200).send(returnedList)

    } catch(err) {
        return res.status(401).send(err.message)
    }
};

// exports.searchInInstitutions_post = async (req, res, next) => {
//     try {
//         const returnedList = []
//         const idResults = []
//         const searchArray = req.body.searchedValue.split(' ')
//         const institutions = await Institution.find({})
//         if(searchArray.length>0){
//             for(let i in searchArray){
//                 let regex = new RegExp(searchArray[i], 'i')
//                 for(let index in institutions){
//                     const institution = institutions[index]
//                     if((regex.test(institution.name) || regex.test(institution.recurrence) || regex.test(institution.miniDescription)) && !idResults.includes(institution._id)){
//                         idResults.push(institution._id)
//                         returnedList.push(institution)
//                     }
//                 }
//             }
//         }
//         res.status(200).send(returnedList);
//     } catch(err) {
//         return res.status(401).send(err.message)
//     }
// };


exports.fetchRoles_get = async (req, res, next) => {
    try {
        let roles = await Role.find({})
        res.status(200).send(roles)
 
    } catch(err) {
        return res.status(401).send(err.message)
    }
};

exports.fetchRoles_post = async (req, res, next) => {
    try {
        const institutionId = req.body.institutionId
        if(institutionId!=undefined){
            let roles = await Role.find({institutionId:institutionId})
            let results=[]
            for(let index in roles){
                let member = await Account.findById(roles[index].addedBy)
                let addedByPseudo
                if(member){addedByPseudo=member.pseudo}else{addedByPseudo='inconnu'}
                results=[...results, {...roles[index]._doc, addedByPseudo : addedByPseudo}]
            }
            console.log("results", results)
            res.status(200).send(results )
        }else{
            return res.status(401).send("Institution Id is required. Please contact an admin")
        }
    } catch(err) {
        return res.status(401).send(err.message)
    }
};

exports.searchInRoles_post = async (req, res, next) => {
    try {
        const returnedList = []
        const idResults = []

        const searchArray = req.body.value.split(' ')
        let roles
        console.log(req.body.institutionId!=undefined)
        if(req.body.institutionId!=undefined){
            roles = await Role.find({institutionId : req.body.institutionId})
        } else {
            roles = await Role.find({})
        }
        if(searchArray.length>0){
            for(let i in searchArray){
                let regex = new RegExp(searchArray[i].normalize("NFD").replace(/[\u0300-\u036f]/g, ""), 'i')
                for(let index in roles){
                    const role = roles[index]
                    let name = role.name.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
                    let miniDescription = role.miniDescription.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
                    if((regex.test(name) || regex.test(miniDescription)) && !idResults.includes(role._id)){
                        idResults.push(role._id)
                        returnedList.push(role)
                    }
                }
            }
        }

            
        res.status(200).send(returnedList);
    } catch(err) {
        return res.status(401).send(err.message)
    }
};


// Experiences
exports.fetchExperiences_get = async (req, res, next) => {
    try {
        let returnedList = []
        const personId = req.query.personId
        let experiences = await Experience.find({personId:personId}).sort( { dateOfStart : -1} )
        for(let index in experiences){
            let roleId = experiences[index].roleId
            let institutionId = experiences[index].institutionId

            let role = await Role.findById(roleId)
            let institution = await Institution.findById(institutionId)
            let user = await Account.findById(experiences[index].addedBy)
            let role_
            let userObject = {
                _id : user._id,
                pseudo : user.pseudo,
            }
            if(role&&institution){
                
                let recurrence = institution.recurrence
                console.log("recurrence", recurrence)
                console.log("recurrence wilaya", recurrence=="Wilaya")
                console.log("recurrence Daira", recurrence=="Daira")
                console.log("recurrence Commune", recurrence=="Commune")
                
                if(recurrence=="Pays"){
                    institutionLibele = `${institution.name}`
                }else if(recurrence=="Wilaya"){
                    institutionLibele = `${institution.name} de ${experiences[0].wilaya}`
                }else if(recurrence=="Daira"){
                    institutionLibele = `${institution.name} de ${experiences[0].daira}, wilaya de ${experiences[0].wilaya}`
                }else if(recurrence=="Commune"){
                    institutionLibele = `${institution.name} de ${experiences[0].commune}, wilaya de ${experiences[0].wilaya}`
                }else {
                    institutionLibele = `${institution.name}`
                }
                console.log("role_", role_)
                role.title = role_
                returnedList = [
                    ...returnedList, 
                    {
                        ...experiences[index]._doc,
                        institution : {
                            ...institution._doc,
                            libele : institutionLibele
                        },
                        role: role,
                        addedBy : userObject,
                    }
                ]
            }
        }

        res.status(200).send(returnedList)
    } catch(err) {
        return res.status(401).send(err.message)
    }
};


// Experiences
exports.fetchMemberInfoById_get = async (req, res, next) => {
    try {
        const memberId = req.query.memberId
        
        let account = await Account.findById(memberId);
        if(!account){return res.status(401).send("Member not found") }

        let accountInfo = {
            pseudo : account.pseudo,
            email : account.email,
            role : account.role,
            // dateOfRegistration : account.dateOfRegistration,

            // firstName : account.firstName,
            // lastName : account.lastName,
            // dateOfBirth : account.dateOfBirth,
            // fromCity : account.fromCity,
            // fromCountry : account.fromCountry,
        }

        res.status(200).send(accountInfo)
    } catch(err) {
        return res.status(401).send(err.message)
    }
};


exports.fetchKeyFigures_get = async (req, res, next) => {
    try {
        //membres
        //Personnes
        //Institution 
        
        let members = await Account.countDocuments({})
        let institutions = await Institution.countDocuments({})
        let persons = await PersonProfile.countDocuments({})

        res.status(200).send({
            members : members,
            institutions : institutions,
            persons : persons
        })

    } catch(err) {
        return res.status(401).send(err.message)
    } 
};