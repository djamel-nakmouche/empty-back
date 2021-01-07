const mongoose = require('mongoose');

const Schema = mongoose.Schema; 

const personProfileVoteSchema = new Schema(
    {        
      personId : {type: String, required: true, min: 1, max: 255 },
      accountId : {type: String, required: true, min: 1, max: 255 },
      type : {type: Boolean, min: 1, max: 255 },
    }, {
      timestamps: true
    }
); 


module.exports = mongoose.model('personProfileVote', personProfileVoteSchema);
