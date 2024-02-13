const {Schema,model} = require("mongoose")

const userSchema = new Schema({
    
    username:String,
    email:String,
    password:String,
    mobile :Number,
    role:String,
    isActive:{
        type:Boolean,
        default:true
    }

},{timestamps:true})

const UserModel = model("UserModel",userSchema)

module.exports = UserModel