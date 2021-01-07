const mongoose = require('mongoose');

const Schema = mongoose.Schema;

var personProfilePictureSchema = new Schema({
  personId : {type : String},
  img : {type : Buffer},
  contentType : {type : String},
  addedBy : {type : String, required: true, min: 1, max: 255 },
  adminValidation : {type : String, required : true, default : "pending"},
  }, {
    timestamps: true
  }
);


module.exports = mongoose.model('personProfilePicture', personProfilePictureSchema);