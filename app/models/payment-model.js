const {Schema,model} = require("mongoose")

const paymentSchema = new Schema({
    
    userId:{
        type:Schema.Types.ObjectId,
        ref:"UserModel"
    },
    bookingId:{
        type:Schema.Types.ObjectId,
        ref:"BookingModel"
    },
    paymentDate:Date,
    amount :Number,
    paymentType:String,
    transaction_Id:String,
    status:{
        type:Boolean,   //Payment 
        default:false
    }
  
},{timestamps:true})

const PaymentModel = model("PaymentModel",paymentSchema)

module.exports = PaymentModel





     