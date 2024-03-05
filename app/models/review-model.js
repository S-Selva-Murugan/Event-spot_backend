const { Schema, model } = require("mongoose")
 
const reviewSchema = new Schema({
    eventId: {
        type: Schema.Types.ObjectId,
        ref: "EventModel"
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: "UserModel" 
    },
    title: {
        type: String
    },
    body: {
        type: String
    },
    rating: {
        type: String
    }
});

const ReviewModel = model("ReviewModel", reviewSchema)

module.exports = ReviewModel