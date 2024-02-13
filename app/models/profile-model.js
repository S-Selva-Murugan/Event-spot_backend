const {Schema,model} = require("mongoose")

const profileSchema = new Schema({
    
    profilePic:String,
    description:String,
    userId:{
        type:Schema.Types.ObjectId,
        ref:"UserModel"
    },
    addressInfo: {
        address: String,
        city: String
    },
    location: {
        type: {
            type: String,
            enum: ['Point'] //Point
        },
        coordinates: {
            type: [Number] // Geospatial data for 2d sphere
        }
    },
    bookings:[{
        type:Schema.Types.ObjectId,
        ref:"BookingModel"
    }]

},{timestamps:true})

const ProfileModel = model("ProfileModel",profileSchema)

module.exports = ProfileModel