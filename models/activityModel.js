const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const activitySchema = new Schema(
    {        
        userId : {type: String, min: 1, max: 255 },
        IPAddress : {type: String, min: 1, max: 255 },
        geoIP : {type: Object, min: 1, max: 255 },
        operation :{type: String, required: true, min: 1, max: 255 },
        // body :{type: Object, min: 1, max: 255 },
        // errorType : {type: String, min: 1, max: 255 }
    }, {timestamps: true}
)

module.exports = mongoose.model('activity', activitySchema);
