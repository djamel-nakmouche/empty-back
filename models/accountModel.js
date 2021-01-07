const mongoose = require('mongoose');
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken');
require('dotenv').config()

const Schema = mongoose.Schema; 

const accountSchema = new Schema(
    {        
      pseudo : {type : String,  required : true, min: 1, max: 255 },
      email :  {type: String, required : true, min: 1, max: 255 },
      password :  {type: String,  required : true, min: 6, max: 1024 },
      
      firstName : {type: String, min: 1, max: 255 },
      lastName : {type: String, min: 1, max: 255 },
      gender : {type: String, min: 1, max: 255 },
      dateOfBirth : {type: String, min: 1, max: 255 },
      fromCity : {type: String, min: 1, max: 255 },
      fromCountry : {type: String, min: 1, max: 255 },
      
      profilePictureId : {type: String, min: 1, max: 255 },
      defaultProfilePictureId : {type: String, min: 1, max: 255 },

      verifiedEmail : {type : Boolean, default : false},
      disabledByAdmin :  {type: Boolean,  default : false },
      disabledByUser :  {type: Boolean,  default : false },

      role :  {type: String, required : true, default : "member", min: 1, max: 255 },
      
      dateOfRegistration : {type: Date, default: Date.now},
      tokenExpiresIn : {type: Number, default: 30*24*60*60},
    }, {
      timestamps: true
    }
); 

accountSchema.methods = {
  auth: function(password) {
  //   return passwordHash.verify(password, this.mataData.auth.password);
    return bcrypt.compare(password, this.password);
  },
  getToken: function() {
    return jwt.sign({_id: this._id, role: this.role}, process.env.TOKEN_SECRET, { expiresIn: this.tokenExpiresIn });
  }
};
module.exports = mongoose.model('account', accountSchema);
