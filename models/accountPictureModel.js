const mongoose = require('mongoose');

const Schema = mongoose.Schema;

var accountProfilePictureSchema = new Schema({
  accountId : {type : String},
  img : {type : Buffer},
  contentType : {type : String},
  addedBy : {type : String, required: true, min: 1, max: 255 },

  }, {
    timestamps: true
  }
);


module.exports = mongoose.model('accountProfilePicture', accountProfilePictureSchema);