const mongoose = require('mongoose');

const Schema = mongoose.Schema; 

const personProfileSchema = new Schema(
    {        
      firstName : {type: String, required: true, min: 1, max: 255 },
      lastName : {type: String, required: true, min: 1, max: 255 },
      dateOfBirth : {type: String, min: 1, max: 255 },
      wilayaOfBirth : {type: String, min: 1, max: 255 },
      gender : {type: String, required: true, min: 1, max: 255 },
      miniBio : {type: String},
      
      profilePictureId : {type: String, min: 1, max: 255 },
      defaultProfilePictureId : {type: String,  required: true, min: 1, max: 255 },

      addedBy : {type: String, required: true, min: 1, max: 255 },
      viewsCount : {type: Number, required: true, default: 1,  min: 1, max: 255 },
      adminValidation : {type: String, required: true, default:"pending"},
    
    }, {
      timestamps: true
    }
); 


module.exports = mongoose.model('personProfile', personProfileSchema);
