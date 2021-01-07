const mongoose = require('mongoose');

const Schema = mongoose.Schema; 

const roleSchema = new Schema(
    {        
      name : {type: String, required: true, min: 1, max: 255 },
      institutionId : {type: String, required : true, min: 1, max : 255},
      miniDescription : {type: String},
      addedBy : {type: String, required: true, min: 1, max: 255 },

      adminValidation : {type: String, default: "pending" },

    }, {
      timestamps: true
    }
); 


module.exports = mongoose.model('role', roleSchema);
