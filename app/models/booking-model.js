const {Schema,model} = require("mongoose")

const bookingSchema = new Schema({
    
    userId:{
        type:Schema.Types.ObjectId,
        ref:"UserModel"
    },
    eventId:{
        type:Schema.Types.ObjectId,
        ref:"EventModel"
    },
    tickets : [
         { 
        ticketId:{
            type:Schema.Types.ObjectId,
            ref:"EventModel"
        },
        ticketType:String, 
        quantity:Number, 
        totalAmount:Number,
        ticketPrice:Number
    }
    ],

    
    status: {
        type:Boolean,
        default:false
    }

},{timestamps:true})

const BookingModel = model("BookingModel",bookingSchema)

module.exports = BookingModel



