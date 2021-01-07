const mongoose = require('mongoose');

const Schema = mongoose.Schema; 

const personCommentVoteSchema = new Schema(
    {        
      commentId : {type: String, required: true, min: 1, max: 255 },
      accountId : {type: String, required: true, min: 1, max: 255 },
    }, {
      timestamps: true
    }
); 

module.exports = mongoose.model('personCommentVote', personCommentVoteSchema);
