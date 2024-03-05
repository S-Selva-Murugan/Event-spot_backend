const { validationResult } = require('express-validator');
const EventModel = require('../models/event-model');
const ReviewModel = require("../models/review-model")
const _= require('lodash')

// Create a review for an event
reviewCltr = {}
reviewCltr.createReviewForEvent = async (req, res) => {
    const errors = validationResult(req)
    if(!errors.isEmpty()) return res.status(400).json({errors:errors.array()})
    try {
        const { eventId } = req.params;
        const { title, body, rating } = req.body;

        // Create a new review instance
        const newReview = new ReviewModel({
            eventId,
            userId: req.user.id,
            title,
            body,
            rating
        });

        const savedReview = await newReview.save();


        // Save the review to the database
        const populatedReview = await ReviewModel.findById(savedReview._id).populate('userId');
        const finalResponse={
            reviewId:populatedReview,
            _id:savedReview._id
        }

        // Push the review ID to the event's reviews array
        await EventModel.findByIdAndUpdate(eventId, { $push: { reviews: { reviewId: savedReview._id } } });
        console.log(finalResponse);
        res.status(201).json(finalResponse);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server Error' });
    }
};


// Update a review for an event
reviewCltr.updateReviewForEvent = async (req, res) => {
    const errors = validationResult(req)
    if(!errors.isEmpty()) return res.status(400).json({errors:errors.array()})
    try {
        const { eventId, reviewId } = req.params;
        const body = _.pick(req.body,["title","body","rating"])

        // Find the review by ID
        const event = await EventModel.findById(eventId)
        if(!event) res.status(404).json("Event Not Found")

        const reviewToUpdate = await ReviewModel.findByIdAndUpdate({_id:reviewId},body,{new:true}).populate({path:"userId",select:"_id username email"})

        if (!reviewToUpdate) {
            return res.status(404).json({ error: "Review not found" });
        }

        // Prepare the final response
        const finalResponse = {
            reviewId: reviewToUpdate,
            _id: reviewId
        };

        res.status(200).json(finalResponse);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server Error' });
    }
}


// Delete a review for an event
reviewCltr.deleteReviewForEvent = async (req, res) => {
    try {
        const { eventId, reviewId } = req.params;

        // Remove the review ID from the event's reviews array
        await EventModel.findByIdAndUpdate(eventId, { $pull: { reviews: { reviewId } } });

        // Delete the review
        await ReviewModel.findOneAndDelete({_id:reviewId,userId:req.user.id});

        res.json({ message: 'Review deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server Error' });
    }
};


module.exports = reviewCltr
