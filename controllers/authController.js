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
const Activity = require('../models/activityModel')
const activityTypes = require('../assets/constants/activityTypes')

const devConstants = require('../assets/constants/devConstants')

const crypto = require('crypto');
var geoip = require('geoip-lite');

// AUTHENTIFICATION 
// REGISTER
exports.register_post = async (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).send(errors.errors[0].msg);
    else {
        const pseudo = req.body.pseudo.toLowerCase()
        const pseudoExists = await Account.findOne({"pseudo": pseudo});
        if(pseudoExists) return res.status(400).send('Ce pseudo existe déjà');
        
        const pseudoValidation = functions.pseudoSyntaxeValidation(req.body.pseudo)
        if(!pseudoValidation) return res.status(400).send('Le pseudo doit contenir uniquement des lettres, des chiffres et des underscores. Il doit contenir au moins 4 caractères.');

        const email = req.body.email.toLowerCase()
        const emailExist = await Account.findOne({"email": email});
        if(emailExist) return res.status(400).send('Cet email existe déjà');

        const syntaxeValidation = functions.passwordSyntaxeValidation(req.body.password)
        if(!syntaxeValidation) return res.status(400).send('Le mot de passe ne respecte pas les conditions de sécurité.');

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.password, salt);

        let defaultProfilePictures = await DefaultProfilePictures.find({});

        // newPerson.defaultProfilePictureId= defaultProfilePictures[functions.getRandomInt(defaultProfilePictures.length)]._id       


        var account = new Account({        
            pseudo :  pseudo,
            email :  email,
            password : hashedPassword,
            defaultProfilePictureId : defaultProfilePictures[functions.getRandomInt(defaultProfilePictures.length)]._id,
        });
        

        let ip 
        ip= req.headers['x-forwarded-for']
        if(!ip){ip = req.connection.remoteAddress}
        if(!ip){ip = req.ip}

        let geo = geoip.lookup(ip)
        
        var activity = new Activity({
            userId : account._id,
            IPAddress : ip,
            geoIP : geo,
            operation : activityTypes.register,
        })

        activity.save(function (err) {
            if (err) { next(); }
        })

        // Save Account.
        account.save(function (err) {
            if (err) { return res.status(500).send(err.message)} //next(err); }
            const tokenEmailConfirm = new TokenEmailConfirm({ _userId: account._id, token: crypto.randomBytes(16).toString('hex') });
            tokenEmailConfirm.save(function (err) {
                if (err) { return res.status(500).send(err.message)}
                sgMail.setApiKey(process.env.SENDGRID_API_KEY);
                
                let confLink = 'http:\/\/' + req.headers.host + '\/auth\/confirmation\/' + tokenEmailConfirm.token

                const sentText = `
                    <p>Bonjour,</p>
                    <p>Afin de pouvoir vérifier votre adresse email de connexion sur la plateforme Chkoune Flane et utiliser votre compte de manière complète, merci de cliquer sur le lien <a href='${confLink}'>ici</a></p>
                    <p>Si vous n\'avez pas demandé à être enregistré sur notre plateforme, vous pouvez ignorer ce message</p>
                    <p>L\'équipe Chkoune Flane</p>
                    `
                
                const msg = {
                    to: email,
                    from: process.env.DONOTREPLY_MAIL,
                    subject: 'Chkoune Flane - E-mail Confirmation',
                    html : sentText,

                    // text: 'Bonjour,\n\n' + 'Afin de pouvoir vérifier votre adresse email et utiliser votre compte de manière complète, merci de cliquer sur le lien ci-dessou. Si vous n\'avez pas demandé d\'être enregistré dans notre siteweb, vous pouvez ignorer ce message : \n\nhttp:\/\/' + req.headers.host + '\/auth\/confirmation\/' + tokenEmailConfirm.token + ' \n'
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
    }
};

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

                let confLink = 'http:\/\/' + req.headers.host + '\/auth\/confirmation\/' + tokenEmailConfirm.token

                const sentText = `
                    <div>Bonjour,</div>
                    <div>Afin de pouvoir vérifier votre adresse email de connexion sur la plateforme Chkoune Flane et utiliser votre compte de manière complète, merci de cliquer sur le lien <a href='${confLink}'>ici</a></div>
                    <div>Si vous n\'avez pas demandé à être enregistré sur notre plateforme, vous pouvez ignorer ce message</div>
                    <div>L\'équipe Chkoune Flane</div>
                    `
                const msg = {
                    to: email,
                    from: process.env.DONOTREPLY_MAIL,
                    subject: 'Chkoune Flane - E-mail Confirmation',
                    html : sentText,
                    // text: 'Bonjour,\n\n' + 'Afin de pouvoir vérifier votre nouvelle adresse email et utiliser votre compte de manière complète, merci de cliquer sur le lien ci-dessou. Si vous n\'avez pas demandé d\'être enregistré dans notre siteweb, vous pouvez ignorer ce message : \n\nhttp:\/\/' + req.headers.host + '\/auth\/confirmation\/' + tokenEmailConfirm.token + ' \n'
                };
                sgMail
                .send(msg)
                .then(() => {
                    console.log('Email sent', email)
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
        
        let password = req.body.password
        if(!password){return res.status(401).send("Password not found") }

        const syntaxeValidation = functions.passwordSyntaxeValidation(password)
        if(!syntaxeValidation) return res.status(400).send('Le mot de passe ne respecte pas les conditions de sécurité.');

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        account.password = hashedPassword;

        // Save Account.
        account.save(function (err) {
            if (err) { return res.status(500).send(err.message)} 
        });

    } catch(err) {
        return res.status(401).send(err.message)
    }
};


// EMAIL CONFIRMATION
exports.emailConfirmation_get = async (req, res, next) => {
    const token = req.params.token;
    const tokenEmailConfirm = await TokenEmailConfirm.findOne({token:token});
    if(!tokenEmailConfirm) return res.status(400).send('We were unable to find a valid token. Your token may have expired.' );
    
    const account = await Account.findOne({_id:tokenEmailConfirm._userId})
    if (!account) return res.status(400).send( 'We were unable to find a user for this token.');
    
    account.verifiedEmail = true;

    account.save(function (err) {
        if (err) { return res.status(500).send(err.message) }
        res.redirect(`${devConstants.DNS()}/Login?email=verified`)
    })
};

// LOGIN.
exports.login_post = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).send(errors.errors[0].msg)
    else {
        const email = req.body.email.toLowerCase()

        const account = await Account.findOne({"email": email});
        if(!account) return res.status(400).send('L\'Email renseigné ne figure pas dans nos bases de données.');
        
        const validPass = await account.auth(req.body.password);
        if(!validPass) return res.status(400).send('Mot de passe incorrect');
        if(!account.verifiedEmail) return res.status(401).send('Merci de valider votre adresse email avant d\'accéder à votre compte !');
        
        let ip 
        ip= req.headers['x-forwarded-for']
        if(!ip){ip = req.connection.remoteAddress}
        if(!ip){ip = req.ip}

        let geo = geoip.lookup(ip)
        
        var activity = new Activity({
            userId : account._id,
            IPAddress : ip,
            geoIP : geo,
            operation : activityTypes.login,
        })

        activity.save(function (err) {
            if (err) { next(); }
        })

        const token = account.getToken();
        res.header('auth-token', token).json({
            userId: account._id, 
            tokenExpiresIn: account.tokenExpiresIn, 
            token: token,
            ip1 : req.connection.remoteAddress,
            ip2 : req.headers['x-forwarded-for'],
            geoip : geo,
        });
    }
};


// TOKEN CHECK.
exports.tokenCheck_get = async (req, res, next) => {
    const token = req.params.token;
    try {
        decoded = jwt.verify(token, process.env.TOKEN_SECRET);
        const patientId = decoded._id
        if(decoded){
            return res.status(200).send({validToken : true})
        } else{
            return res.status(501).send({validToken : false})
        }
    } catch(err) {
        return res.status(401).send(err.message)
    }
};




// EMAIL CHECK FOR PASSWOR RESET
exports.sendEmailForPasswordReset_post = async (req, res, next) => {
    try {
        
        const email = req.body.email.toLowerCase()
        if(!email){return res.status(401).send("Veuillez insérer votre email d'inscription") }

        let person = await Account.findOne({email : email});

        const token = person.getToken();
        const tokenResetPassword = new TokenResetPassword({ memberId: person._id, token: token });
        
        const confLink = 'http:\/\/' + req.headers.host + '\/auth\/resetpassword\/' + token
            const sentText = `
        <div>Bonjour,</div>
        <div>Vous pouvez modifier votre mot de passe en cliquant <a href='${confLink}'>ici</a></div>
        `
        
        tokenResetPassword.save(function (err) {
            if (err) { return res.status(500).send(err.message)}

            sgMail.setApiKey(process.env.SENDGRID_API_KEY);
            const msg = {
                to: email,
                from: process.env.DONOTREPLY_MAIL,
                subject: 'Chkoune Flane - Re-saisie de votre mot de passe',
                html : sentText,
            };
            sgMail.send(msg);
            res.status(200).send({success : true});
        })

    } catch(err) {
        return res.status(401).send(err.message)
    }

    
};

exports.resetPasswordToken_get = async (req, res, next) => {


    try {
        const token = req.params.token;
        let decoded = jwt.verify(token, process.env.TOKEN_SECRET);
        if(!decoded){return res.status(401).send("Not authorized") }
        
        let tokenResetPassword = await TokenResetPassword.findOne({token:token});
        if(!tokenResetPassword){return res.status(401).send("Not authorized") }

        let memberId = tokenResetPassword.memberId;
        if(!decoded._id || !tokenResetPassword || decoded._id!=memberId) { return res.status(401).send("Unvalid Token.") }
        let query = objectToQueryParamsString({token : token})
        res.redirect(`${devConstants.DNS()}/PasswordSet${query}`)

    } catch(err) {
        return res.status(401).send(err.message)
    }
};

exports.setPassword_get = async (req, res, next) => {

    try {
        const token = req.body.token;
        let decoded = jwt.verify(token, process.env.TOKEN_SECRET);
        if(!decoded){return res.status(401).send("Not authorized") }
        
        let tokenResetPassword = await TokenResetPassword.findOne({token:token});
        if(!tokenResetPassword){return res.status(401).send("Not authorized") }

        let memberId = tokenResetPassword.memberId;
        if(!decoded._id || !tokenResetPassword || decoded._id!=memberId) { return res.status(401).send("Unvalid Token.") }
        
        let account = await Account.findById(memberId);
        if(!account){return res.status(401).send("Une erreur est survenue. Veuillez recommencer") }

        const syntaxeValidation = functions.passwordSyntaxeValidation(req.body.password)
        if(!syntaxeValidation) return res.status(400).send('Le mot de passe ne respecte pas les conditions de sécurité.');

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.password, salt);
        account.password = hashedPassword

        // Save Account.
        account.save(function (err) {
            if (err) { return res.status(500).send(err.message)} //next(err); }
            res.status(200).send({success : true});
        });
    } catch(err) {
        return res.status(401).send(err.message)
    }

};




// EMAIL CHECK FOR PASSWOR RESET
exports.sendValidationEmail_post = async (req, res, next) => {
    try {
        
        const email = req.body.email.toLowerCase()
        if(!email){return res.status(401).send("Veuillez insérer votre email d'inscription") }

        let person = await Account.findOne({email : email});

        const token = person.getToken();
        const tokenEmailConfirm = new TokenEmailConfirm({ _userId: person._id, token: token });
        
        const confLink = 'http:\/\/' + req.headers.host + '\/auth\/confirmation\/' + token
            const sentText = `
        <div>Bonjour,</div>
        <div>Si vous avez demander une inscription au sein de notre plateforme, veuillez cliquer <a href='${confLink}'>ici</a> afin de valider votre adresse email</div>
        <div>Si vous n'êtes pas à l'initiative de cet email, veuillez ignorer ce message.</div>
        <div>Très bonne journée,</div>
        <div>L'équipe technique,</div>
        `
        
        tokenEmailConfirm.save(function (err) {
            if (err) { return res.status(500).send(err.message)}

            sgMail.setApiKey(process.env.SENDGRID_API_KEY);
            const msg = {
                to: email,
                from: process.env.DONOTREPLY_MAIL,
                subject: 'Chkoune Flane - Validation de l\'adresse email',
                html : sentText,
            };
            sgMail.send(msg);
            res.status(200).send({success : true});
        })

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

        let accountInfo = {
            pseudo : account.pseudo,
            email : account.email,
            role : account.role,
            dateOfRegistration : account.dateOfRegistration,

            firstName : account.firstName,
            lastName : account.lastName,
            dateOfBirth : account.dateOfBirth,
            fromCity : account.fromCity,
            fromCountry : account.fromCountry,
        }

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
        
        if(req.body.pseudo!=undefined){
            let pseudo =req.body.pseudo.toLowerCase()

            let accnt = await Account.findOne({pseudo : pseudo});
            if(accnt._id == undefined){
                const pseudoValidation = functions.pseudoSyntaxeValidation(pseudo)
                if(!pseudoValidation) return res.status(400).send('Le pseudo doit contenir uniquement des lettres, des chiffres et des underscores. Il doit contenir au moins 4 caractères.');
                account.pseudo=req.body.pseudo
            } else {
                return res.status(401).send("Le pseudo choisi n'est pas disponible, veuillez en choisir un autre")
            }
        }

        if(req.body.firstName!=undefined){account.firstName=req.body.firstName}
        if(req.body.lastName!=undefined){account.firstName=req.body.lastName}
        if(req.body.dateOfBirth!=undefined){account.firstName=req.body.dateOfBirth}
        if(req.body.fromCity!=undefined){account.firstName=req.body.fromCity}
        if(req.body.fromCountry!=undefined){account.firstName=req.body.fromCountry}
        
        res.status(200).send("Modifications done")
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

        res.status(200).send({PseudoAvailable : available})

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

