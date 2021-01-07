const mongoose = require('mongoose');

const Schema = mongoose.Schema;

var defaultInstitutionPictureSchema = new Schema({
  img : {type : Buffer},
  contentType : {type : String},
  }, {
    timestamps: true
  }
);


module.exports = mongoose.model('defaultInstitutionPicture', defaultInstitutionPictureSchema);