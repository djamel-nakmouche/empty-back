var functions = require('../assets/functions/functions');
const bcrypt = require('bcryptjs');
const sgMail = require('@sendgrid/mail');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const {objectToQueryParamsString} = require('../assets/functions/functions')

const Account = require('../models/accountModel')
const TokenEmailConfirm = require('../models/tokenEmailConfirmModel')
const TokenResetPassword = require('../models/tokenResetPassword')

const DefaultProfilePictures = require('../models/defaultInstiutionPicturesModel')
const AccountProfilePictures = require('../models/accountPictureModel')

const devConstants = require('../assets/constants/devConstants')
const crypto = require('crypto');
const fs = require('fs')


// Reset Email
exports.resetEmail_post = async (req, res, next) => {
    try {
        const token = req.headers.authorization.split(' ')[1]
        let decoded = jwt.verify(token, process.env.TOKEN_SECRET);
        if(!decoded){return res.status(401).send("Not authorized") }
        if(!decoded._id){return res.status(401).send("Not authorized") }

        const account = await Account.findById(decoded._id);
        if(!account){return res.status(401).send("Account not found") }

        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).send(errors.errors[0].msg);
    
        const email = req.body.email.toLowerCase()
        const emailExist = await Account.findOne({"email": email});
        if(emailExist) return res.status(400).send('Cet email existe déjà');
        
        account.email = email
        account.verifiedEmail = false

        // Save Account.
        account.save(function (err) {
            if (err) { return res.status(500).send(err.message)} 
            const tokenEmailConfirm = new TokenEmailConfirm({ _userId: account._id, token: crypto.randomBytes(16).toString('hex') });
            tokenEmailConfirm.save(function (err) {
                if (err) { return res.status(500).send(err.message)}
                sgMail.setApiKey(process.env.SENDGRID_API_KEY);
                const msg = {
                    to: email,
                    from: process.env.DONOTREPLY_MAIL,
                    subject: 'Chkoune Flane - E-mail Confirmation',
                    text: 'Bonjour,\n\n' + 'Afin de pouvoir vérifier votre nouvelle adresse email et utiliser votre compte de manière complète, merci de cliquer sur le lien ci-dessou. Si vous n\'avez pas demandé d\'être enregistré dans notre siteweb, vous pouvez ignorer ce message : \n\nhttp:\/\/' + req.headers.host + '\/auth\/confirmation\/' + tokenEmailConfirm.token + ' \n'
                };
                sgMail
                .send(msg)
                .then(() => {
                    console.log('Email sent')
                })
                .catch((error) => {
                    console.error(error)
                    console.error(error.response.body.errors)
                });
                res.send({user: account._id});
            })
        });
    } catch(err) {
        return res.status(401).send(err.message)
    }
};


// Reset Password
exports.resetPassword_post = async (req, res, next) => {
    try {
        const token = req.headers.authorization.split(' ')[1]
        let decoded = jwt.verify(token, process.env.TOKEN_SECRET);
        if(!decoded){return res.status(401).send("Not authorized") }
        if(!decoded._id){return res.status(401).send("Not authorized") }

        const account = await Account.findById(decoded._id);
        if(!account){return res.status(401).send("Account not found") }

        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).send(errors.errors[0].msg);
        
        const validPass = await account.auth(req.body.currentPassword);
        if(!validPass) return res.status(400).send('Le mot de passe actuel saisi est incorrect');
        
        let password = req.body.newPassword
        if(!password){return res.status(401).send("Password not found") }

        const syntaxeValidation = functions.passwordSyntaxeValidation(password)
        if(!syntaxeValidation) return res.status(400).send('Le mot de passe ne respecte pas les conditions de sécurité.');

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        account.password = hashedPassword;
        // Save Account.
        account.save(function (err) {
            if (err) { return res.status(500).send(err.message)} 
            console.log("password changed")
            res.status(200).send("Password changed successfuly")
        });

    } catch(err) {
        return res.status(401).send(err.message)
    }
};



// Account Info
//Fetch
exports.fetchAccountInfo_get = async (req, res, next) => {
    try {
        const token = req.headers.authorization.split(' ')[1]
        let decoded = jwt.verify(token, process.env.TOKEN_SECRET);
        if(!decoded){return res.status(401).send("Not authorized") }
        if(!decoded._id){return res.status(401).send("Not authorized") }
        
        let account = await Account.findById(decoded._id);
        if(!account){return res.status(401).send("An error accured") }

        let profilePictureId = account.profilePictureId
        let profilePicture
        if(!profilePictureId){
            defaultProfilePictureId = account.defaultProfilePictureId
            profilePicture = await DefaultProfilePictures.findById(defaultProfilePictureId)
        } else{
            profilePicture = await AccountProfilePictures.findById(profilePictureId)
        }

        let accountInfo = {
            pseudo : account.pseudo,
            email : account.email,
            role : account.role,
            dateOfRegistration : account.dateOfRegistration,

            firstName : account.firstName,
            lastName : account.lastName,
            gender : account.gender,
            dateOfBirth : account.dateOfBirth,
            fromCity : account.fromCity,
            fromCountry : account.fromCountry,
            profilePicture : profilePicture,

        }
        console.log("accountInfo", accountInfo)

        res.status(200).send(accountInfo)
    } catch(err) {
        return res.status(401).send(err.message)
    }
};


// Edit info
exports.editAccountInfo_post = async (req, res, next) => {
    try {

        const token = req.headers.authorization.split(' ')[1]
        let decoded = jwt.verify(token, process.env.TOKEN_SECRET);
        if(!decoded){return res.status(401).send("Not authorized") }
        if(!decoded._id){return res.status(401).send("Not authorized") }
        
        let account = await Account.findById(decoded._id);
        if(!account){return res.status(401).send("An error accured") }
        
        if(req.body.pseudo!=undefined&&req.body.pseudo.toLowerCase()!=account.pseudo){
            let pseudo =req.body.pseudo.toLowerCase()

            let accnt = await Account.findOne({pseudo : `${pseudo}`});
            console.log("accnt", accnt)
            if(!accnt){
                const pseudoValidation = functions.pseudoSyntaxeValidation(pseudo)
                if(!pseudoValidation) return res.status(400).send('Le pseudo doit contenir uniquement des lettres, des chiffres et des underscores. Il doit contenir au moins 4 caractères.');
                account.pseudo=pseudo
            } else {
                return res.status(401).send("Le pseudo choisi n'est pas disponible, veuillez en choisir un autre")
            }
        }

        console.log("req.body.firstName", req.body.firstName)
        if(req.body.firstName!=undefined){account.firstName=req.body.firstName; console.log("firstName done")}
        if(req.body.lastName!=undefined){account.lastName=req.body.lastName}
        if(req.body.gender!=undefined){account.gender=req.body.gender}
        if(req.body.dateOfBirth!=undefined){account.dateOfBirth=req.body.dateOfBirth}
        if(req.body.fromCity!=undefined){account.fromCity=req.body.fromCity}
        if(req.body.fromCountry!=undefined){account.fromCountry=req.body.fromCountry}
        
        console.log("account edit", account)
        // Save Account.
        account.save(function (err) {
            if (err) { return res.status(500).send(err.message)} 
            res.status(200).send("Modifications done")
        }); 

    } catch(err) {
        return res.status(401).send(err.message)
    }
};


// Edit info
exports.checkAvailablePseudo_get = async (req, res, next) => {
    try {
        const token = req.headers.authorization.split(' ')[1]
        let decoded = jwt.verify(token, process.env.TOKEN_SECRET);
        if(!decoded){return res.status(401).send("Not authorized") }
        if(!decoded._id){return res.status(401).send("Not authorized") }
        if(!req.query.pseudoChecked){return res.status(401).send("Please select a pseudo") }
        
        let pseudoChecked =req.body.pseudoChecked.toLowerCase()

        let accnt = await Account.find({pseudo : pseudoChecked});
        let available = false
        if(accnt._id == undefined){available = true }

        res.status(200).send({pseudoAvailable : available})

    } catch(err) {
        return res.status(401).send(err.message)
    }
};












// // RESEND TOKEN
// exports.userResendToken_post = async (req, res, next) => {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) return res.status(400).send(errors.errors[0].msg);
//     else {
//         const confLink = 'http:\/\/' + req.headers.host + '\/authAccount\/confirmation\/' + tokenEmailConfirm.token
//         const sentText = `
//     <div>Bonjour,</div>
//     <div>Veuillez valider votre adresse email en cliquant <a href='${confLink}'>ici</a></div>
//     `
//         const email = req.body.email.toLowerCase()
//         const useraccount = await UserAccount.findOne({"metaData.auth.email": email});
//         if(!useraccount) return res.status(400).send('Email does not exist in our Data base or has already been validated. Please check the email or Login.');
//         const verifiedEmail = useraccount.metaData.auth.verifiedEmail;
//         if(!useraccount || verifiedEmail) return res.status(400).send('Email does not exist in our Data base or has already been validated. Please check the email or Login.');
//         const tokenEmailConfirm = new TokenEmailConfirm({ _userId: useraccount._id, token: crypto.randomBytes(16).toString('hex') });
//         tokenEmailConfirm.save(function (err) {
//             if (err) { return res.status(500).send(err.message)}
//             sgMail.setApiKey(process.env.SENDGRID_API_KEY);
//             const msg = {
//                 to: email,
//                 from: process.env.DONOTREPLY_MAIL,
//                 subject: 'E-mail Confirmation',
//                 html : sentText
//                 // text: 'Hello,\n\n' + 'Please verify your account by clicking the link: \n\nhttp:\/\/' + req.headers.host + '\/authAccount\/confirmation\/' + tokenEmailConfirm.token + ' \n'
//             //   html: '<strong>and easy to do anywhere, even with Node.js</strong>',
//             };
//             sgMail.send(msg);
//             res.status(200).send({user: useraccount._id});
//         })
//     }
// };




// exports.resetPassword_post = async (req, res, next) => {
//     const errors = validationResult(req);
//     console.log("resetPassword_post validations", errors)
//     if (!errors.isEmpty()) return res.status(400).send(errors.errors[0].msg)
//     const token = req.body.token;
//     let decoded;
//     try {
//         decoded = jwt.verify(token, process.env.TOKEN_SECRET);
//         const tokenResetPassword = await TokenResetPassword.findOne({token:token});
//         const userId = tokenResetPassword._userId;
//         if(!decoded._id || !tokenResetPassword || decoded._id!=userId) { return res.status(401).send("Unvalid Token. Please try again!") }
//         const useraccount = await UserAccount.findOne({"_id": userId});
//         if(!useraccount) return res.status(400).send('An error has occured. Please try again !');
        
//         const syntaxeValidation = functions.passwordSyntaxeValidation(req.body.password)
//         if(!syntaxeValidation) return res.status(400).send('invalid new password');

//         const salt = await bcrypt.genSalt(10);
//         const hashedPassword = await bcrypt.hash(req.body.password, salt);
//         useraccount.metaData.auth.password = hashedPassword
//         useraccount.save(function (err) {
//             if (err) { return res.status(500).send(err.message)} //next(err); }
//             res.status(200).send({user: useraccount._id});
//         });
    
//     } catch(err) {return res.status(401).send(err.message)}
    
// };


exports.accountAddProfilePicture_post = async (req, res, next) => {
    try {
        const token = req.headers.authorization.split(' ')[1]
        let decoded = jwt.verify(token, process.env.TOKEN_SECRET);
        if(!decoded){return res.status(401).send("Not authorized") }
        if(!decoded._id){return res.status(401).send("Not authorized") }
        
        // if(req.body.accountId==undefined){return res.status(401).send("An error has occured") }
        let account = await Account.findById(decoded._id);
        if(!account){return res.status(401).send("Not authorized") }

        console.log("req.files", 1)
        if(req.file.size <= 1000000) {
            let newImage = new AccountProfilePictures()
            newImage.img = fs.readFileSync(req.file.path)
            newImage.contentType = 'image/jpeg';
            newImage.addedBy = decoded._id

            newImage.save(function(err){
                console.log("newImage", newImage._id)
                if(err){return res.status(400).send(err.message)}
            })
            account.profilePictureId = newImage._id
            console.log("req.files", 2)

            account.save(function(err){
                if(err){return res.status(400).send(err.message)}
                console.log("req.files", 3)

            })

        }else {
            return res.status(401).send("Too heavy file")
        }
        
        res.status(200).send('Image uploaded');

    
    } catch(err) {return res.status(401).send(err.message)}

}


exports.deletePersonProfilePicture_post = async (req, res, next) => {
    try {
        const token = req.headers.authorization.split(' ')[1]
        let decoded = jwt.verify(token, process.env.TOKEN_SECRET);
        if(!decoded){return res.status(401).send("Not authorized") }
        if(!decoded._id){return res.status(401).send("Not authorized") }
        
        let account = await Account.findById(req.body.accountId);
        if(!account){return res.status(401).send("Not authorized") }
        
        account.profilePictureId = null
        person.save(function (err) {
            if (err) {return next(err)}
        }); 
        res.status(200).send("Successful deletion")

    } catch(err) {
        return res.status(401).send(err.message)
    }
};