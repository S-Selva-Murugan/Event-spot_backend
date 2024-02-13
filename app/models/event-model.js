const { Schema, model } = require("mongoose");

const eventSchema = new Schema({
    eventStartDateTime: Date,
    title: String,
    description: String,

    // youtube is like a links
    youTube:{
        title: String,
        url: String
    },

// we add the another video attribute to this
    posters:[{
        ClipName:String,
        image:{
            type:String
        }
    },{


        BrochureName:String,
        image:{
            type:String
        }
    }],
    
    categoryId: {
        type: Schema.Types.ObjectId,
        ref: "CategoryModel"
    },
    ticketType: [{
        ticketName: String,
        ticketPrice: Number,
        ticketCount: Number,
        remainingTickets: Number
    }],
    totalTickets: Number, 
    venueName: String,
    addressInfo: {
        address: String,
        city: String
    },
    location: {
        type: {
            type: String,
            enum: ['Point']
        },
        coordinates: {
            type: [Number] // Geospatial data for 2d sphere
        }
    },
    organiserId: {
        type: Schema.Types.ObjectId,
        ref: 'UserModel'
    },
    isApproved: {
        type: Boolean,
        default: false
    },
    reviews: [{
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'UserModel'
        },
        title: String,
        body: String,
        rating: String
    }],
    actors:[{
        name:String,
    }],
    ticketSaleStartTime: Date,
    ticketSaleEndTime: Date
}, { timestamps: true });

const EventModel = model("EventModel", eventSchema);

module.exports = EventModel;
