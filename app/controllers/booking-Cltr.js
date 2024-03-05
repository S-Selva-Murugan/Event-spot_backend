const { validationResult } = require("express-validator");
const BookingModel = require("../models/booking-model");
const EventModel = require("../models/event-model");
const ProfileModel = require("../models/profile-model")
const ReviewModel = require("../models/review-model")
const moment=require("moment")
const cron = require("node-cron");
const funEmail = require("../utils/NodeMailer/email");

const bookingCltr = {};

bookingCltr.createBooking = async (req, res) => {
///const errors = validation(req) that i am written in the booking validation
    const { eventId } = req.params
    const { tickets } = req.body;

    try {
        const profile = await ProfileModel.findOne({userId : req.user.id})
        if(!profile) await new ProfileModel({userId:req.user.id}).save()
        const event = await EventModel.findById({_id:eventId})
        if (!event) {
            return res.status(404).json({ error: 'Cannot find the Event' });
        }
        //  tickets array to match the bookingModel 
        const transformedTickets = tickets?.map(ticket => ({
            ticketId: ticket._id,
            ticketType: ticket.ticketName,  
            quantity: ticket.Quantity,
            ticketPrice: ticket.ticketPrice,
            totalAmount: ticket.ticketPrice * ticket.Quantity,
        }));
        const totalAmount = transformedTickets?.reduce((total, ticket) => total + (ticket?.ticketPrice * ticket?.Quantity), 0);

        // check if there are enough available seats for the specified ticket types
        const availableSeats = transformedTickets?.every(ticket => {
            const matchingTicket = event?.ticketType?.find(eventTicket => eventTicket?.ticketName === ticket?.ticketType);

            if (!matchingTicket) {
                return false; // ticket not found in the event.ticketType 
            }

            return matchingTicket.remainingTickets >= ticket.quantity;
        });



        if (!availableSeats) {
            return res.status(400).json({ error: 'Not enough available seats for the specified ticket types' });
        }


        const booking = new BookingModel({
            userId: req.user.id,
            eventId,
            tickets: transformedTickets,
            totalAmount: totalAmount,
        })


        const updatedTicketTypes = event.ticketType.map(eventTicket => {
            const matchingTicket = transformedTickets.find(ticket => ticket.ticketType === eventTicket.ticketName);

            if (matchingTicket) {
                // subtract the booked quantity from the remaining tickets
                eventTicket.remainingTickets -= matchingTicket.quantity;

            }

            return eventTicket;
        });

const eventUpdate = await EventModel.findByIdAndUpdate(eventId, {
    ticketType: updatedTicketTypes,
}, { new: true })

await booking.save()

let events = await EventModel.find({isApproved:true}).populate({
    path: "organiserId", select: "_id username email"
})
.populate({
    path: "categoryId", select: "name"
})
.populate({
    path: 'reviews',
    populate: {
        path: 'reviewId',
        model: 'ReviewModel',
    }
});

//  userId field inside each review object
for (let event of events) {
await ReviewModel.populate(event.reviews, { path: 'reviewId.userId', select: '_id username email' });
}


return res.status(201).json({ booking, updatedEvents:events })
    } catch (err) {
        console.error(err);
        return res.status(500).json(err);
    }
};

bookingCltr.TicketsInfo = async (req, res) => {
    const { bookedId } = req.params
    try {
        const ticketInfo = await BookingModel.findOne(
            {
                _id: bookedId,
                userId: req.user.id

            }).populate(
                {
                    path: "userId",
                    select: "_id username email"
                }).populate(
                    {
                        path: "eventId",
                        select: "title eventStartDateTime venueName"
                    })

        if (!ticketInfo) return res.status(404).json("Ticket Not Found")


        return res.status(200).json(ticketInfo)

    } catch (err) {
        console.log(err)
        return res.status(500).json(err)

    }

}

bookingCltr.getAllBookings = async(req,res)=>{
    try{
        const bookings = []
        const foundbookings = await BookingModel.findOne({userId:req.user.id,status:false}).populate({path:"eventId",select:"_id title eventStartDateTime"})
        if(Object.keys(foundbookings).length<0) return res.json("Every thing is Booked status true")
        bookings.push(foundbookings)
        const today = moment().startOf('day')//dis is the today date
        const filterBookings = bookings.filter(booking =>{
            const eventStartDateTime = moment(booking.eventId.eventStartDateTime)
            return eventStartDateTime.isAfter(today)
        })
        return res.status(200).json(filterBookings)
    }catch(err){
        console.log(err)
        return res.status(200).json(err)
    }
}


async function cancelBookingFunction(bookingId){
    try {
        // find the booking
        console.log("In booking")
        const booking = await BookingModel.findById(bookingId)
        console.log(booking)
        
        // find the event
        const event = await EventModel.findById(booking.eventId);
        
        // update tickets for that event
        const updatedTicketTypes = event.ticketType.map(eventTicket => {
            const matchingTicket = booking.tickets.find(ticket => ticket.ticketType === eventTicket.ticketName);
            if (matchingTicket) {
                // increment remaining tickets by the quantity of the booked tickets
                eventTicket.remainingTickets += matchingTicket.quantity;
            }
            return eventTicket;
        });
        const cancelBooking   =  await BookingModel.findByIdAndDelete(bookingId)
        // update the event with the updated ticket types
        const updatedEvent = await EventModel.findByIdAndUpdate(
            booking.eventId,
            { ticketType: updatedTicketTypes },
            { new: true }
        );
        console.log(updatedEvent)
        return updatedEvent
    } catch (err) {
        console.log(err)
        throw err; 
    }
}



///write a logic in the FE and show Timer of the 5 min if the times exists more then, call canelPayment and also add button to the says cancel payment
bookingCltr.cancelBooking = async (req, res) => {
    const { bookingId } = req.params //send the form front end 
    try {
        const booking = await BookingModel.find({ _id: bookingId})
        //check the if the payment is create for this user and ticket if that sucess then say payment done
        if(!booking) return res.status(404).json("Booking not found")
       const data =  await cancelBookingFunction(bookingId)//calling the booking function to delete the bookings
       if(!data) return res.status(400).json("Somthing went wrong")
       console.log("success")
       return res.status(200).json({updatedEvent:data})

        //in the backend if the booking are created and not yet confirmed within 10 min auto cancel the booking

        if (!booking) {
            return res.status.json(404).json(bookedEvent)
        }else {
            const event = await EventModel.findById(booking.eventId)
            const updatedTicketTypes = event.ticketType.map(eventTicket=>{
                const matchingTicket = booking.tickets.find(ticket=>ticket.ticketType === eventTicket.ticketName)
                if(matchingTicket){
                    eventTicket.remainingTickets += matchingTicket
                }
                return eventTicket
            })

            const updatedEvent = await EventModel.findByIdAndUpdate(booking.eventId,{
                ticketType : updatedTicketTypes
            },{new:true})

            // check if the id is in the booking

        return res.status(200).json({msg:"Your confirmed seats are canceled"})
        }
    } catch (err) {
        console.log(err)
        return res.status(500).json(err)
    }
}


bookingCltr.bookedUsers = async(req,res)=>{
    const {eventId} = req.query 
    console.log(eventId,"sadf")

    try{
        if(eventId){

            //finding the event and then booked user for that event 
            const bookedUsers = await BookingModel.find({eventId:eventId}).populate({
                path:"userId",
                model:"UserModel",
                select:"_id username email"
            })
            return res.status(200).json(bookedUsers)
        }else{
            return res.status(404).json("Event Id is empty")
        }
    }catch(err){
        console.log(err)
        res.status(400).json(err)
    }
}

module.exports = {bookingCltr,cancelBookingFunction}