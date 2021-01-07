const mongoose = require('mongoose');
 
const Schema = mongoose.Schema; 

const experienceSchema = new Schema(
    {              
      personId : {type: String, required: true, min: 1, max: 255 },
      roleId : {type: String, required: true, min: 1, max: 255 },
      roleName : {type: String, required: true, min: 1, max: 255 },
       
      institutionId : {type: String, required: true, min: 1, max: 255 },
      institutionName : {type: String, required: true, min: 1, max: 255 },

      wilaya : {type: String, min: 1, max: 255 },
      daira : {type: String, min: 1, max: 255 },
      commune : {type: String, min: 1, max: 255 },
      
      description : {type: String, min: 1, max : 255},
      dateOfStart : {type: String, required : true, min: 1, max : 255},
      ended : {type : Boolean, required : true},
      dateOfEnd : {type: String },
      addedBy : {type : String, required: true, min: 1, max: 255 },

      adminValidation : {type : String, required : true, default : "pending"},

    }, {
      timestamps: true
    }
); 


module.exports = mongoose.model('experience', experienceSchema);
