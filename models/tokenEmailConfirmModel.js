const mongoose = require('mongoose');
// var moment = require('moment');
const bcrypt = require('bcryptjs');

const tokenEmailConfirmSchema = new mongoose.Schema({
    _userId: { type: mongoose.Schema.Types.ObjectId, required: true},
    token: { type: String, required: true },
    createdAt: { type: Date, required: true, default: Date.now, expires: 43200*7 }
    }, {
        timestamps: true
      }
);

module.exports = mongoose.model('tokenEmailConfirm', tokenEmailConfirmSchema);
