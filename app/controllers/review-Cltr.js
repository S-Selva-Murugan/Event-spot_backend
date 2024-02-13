const EventModel = require("../models/event-model")
const ReviewModel = require("../models/review-model")
const { validationResult } = require("express-validator")
const _ = require('lodash')

const reviewCltr = {}


reviewCltr.create = async (req, res) => {
    try {
        // Validate request parameters
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            console.log(errors.array());
            return res.status(400).json({ errors: errors.array() })
        }

        // Get event ID from parameters
        const eventId = req.params.eventId;

        const { title, body, rating } = _.pick(req.body, ["title", "body", "rating"]);

        const event = await EventModel.findById(eventId);
        if (!event) {
            console.error(`Event not found for ID: ${eventId}`);
            return res.status(404).json({ error: "Event not found" });
        }

        // Check if the user has already written a review for this event
        // const existingReview = event.reviews.find(review => review.userId === req.user.id);
        // if (existingReview) {
        //     return res.status(400).json({ error: "User has already written a review for this event" });
        // }

        // Create review object
        const reviewBody = {
            userId: req.user.id,
            title,
            rating,
            body
        };

        // Update the event with the new review
        event.reviews.push(reviewBody);
        await event.save();

        // Return the created review
        res.status(201).json({ success: true, review: reviewBody });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal Server Error" });
    }
};


reviewCltr.update = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log(errors.array())
        return res.status(400).json({ errors: errors.array() });
    } else {
        const eventId = req.params.eventId;
        const userId = req.user.id;
        const reviewId = req.params.reviewId;

        const body = _.pick(req.body, ["body", "rating"]);

        try {
            const event = await EventModel.findById(eventId);
            console.error(`Event not found for ID: ${eventId}`);
            if (!event) return res.status(404).json("Event not found");

            // Check if the user is the author of the review
            const review = event.reviews.find(ele => ele._id.toString() === reviewId);
            if (!review) return res.status(404).json("Review not found");
            
            if (review.userId.toString() !== userId) {
                return res.status(403).json("You are not authorized to update this review");
            }

            // Update the review fields
            review.body = body.body;
            review.rating = body.rating;

            await event.save();

            res.status(200).json({ success: true, review });
        } catch (err) {
            console.log(err);
            res.status(500).json({ error: "Internal Server Error" });
        }
    }
};

reviewCltr.delete = async (req, res) => {
    try {
        const eventId = req.params.eventId;
        const reviewId = req.params.reviewId;
        const userId = req.user.id;

        // Find the event by ID
        const event = await EventModel.findById(eventId);
        if (!event) {
            return res.status(404).json({ error: "Event not found" });
        }

        // Find the review within the event
        const review = event.reviews.find(ele => ele._id.toString() === reviewId);
        if (!review) {
            return res.status(404).json({ error: "Review not found" });
        }

        // Check if the user is the author of the review
        if (review.userId.toString() !== userId) {
            return res.status(403).json({ error: "You are not authorized to delete this review" });
        }

        // Remove the review from the event
        event.reviews = event.reviews.filter(ele => ele._id.toString() !== reviewId);

        // Save the updated event
        await event.save();

        res.status(200).json({ success: true, message: "Review deleted successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal Server Error" });
    }
};



module.exports = reviewCltr