const { Schema, model } = require("mongoose");

const categorySchema = new Schema({
    name: String,
    image:String,
    events: [{
        eventId: {
            type: Schema.Types.ObjectId,
            ref: 'EventModel'
        }
    }]
}, { timestamps: true });

const CategoryModel = model("CategoryModel", categorySchema);

module.exports = CategoryModel;
