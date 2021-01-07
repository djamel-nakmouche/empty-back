const mongoose = require('mongoose');

const tokenresetPasswordSchema = new mongoose.Schema({
    memberId: { type: mongoose.Schema.Types.ObjectId, required: true},
    token: { type: String, required: true },
    createdAt: { type: Date, required: true, default: Date.now, expires: 43200 }
    }, {
        timestamps: true
    }
);

module.exports = mongoose.model('tokenResetPassword', tokenresetPasswordSchema);
