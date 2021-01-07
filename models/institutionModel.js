const mongoose = require('mongoose');

const Schema = mongoose.Schema; 

const institutionSchema = new Schema(
    {        
      name : {type: String, required: true, min: 1, max: 255 },
      public : {type: Boolean, default: true },
      recurrence : {type : String},
      miniDescription : {type: String},
      addedBy : {type: String, required: true, min: 1, max: 255 },
      adminValidation : {type: String, default: "pending" , min: 1, max: 255 },
    
    }, {
      timestamps: true
    }
); 


module.exports = mongoose.model('institution', institutionSchema);
