const mongoose = require('mongoose');

const Schema = mongoose.Schema; 

const personCommentSchema = new Schema(
    {        
      accountId : {type: String, required: true, min: 1, max: 255 },
      personId : {type: String, required : true, min: 1, max : 255},
      comment : {type: String, required : true,},
    }, {
      timestamps: true
    }
); 


module.exports = mongoose.model('personComment', personCommentSchema);
