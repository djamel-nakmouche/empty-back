const mongoose = require('mongoose');

const Schema = mongoose.Schema;

var defaultProfilePictureSchema = new Schema({
  img : {type : Buffer},
  contentType : {type : String},
  }, {
    timestamps: true
  }
);


module.exports = mongoose.model('defaultProfilePicture', defaultProfilePictureSchema);