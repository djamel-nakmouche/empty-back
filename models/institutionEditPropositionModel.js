const mongoose = require('mongoose');

const Schema = mongoose.Schema; 

const institutionEditPropositionSchema = new Schema(
    {        
      name : {type: String, min: 1, max: 255 },
      public : {type: Boolean},
      recurrence : {type : String, min: 1, max: 255 },
      miniDescription : {type: String},
    }, {
      timestamps: true
    }
); 


module.exports = mongoose.model('institutionEditProposition', institutionEditPropositionSchema);
