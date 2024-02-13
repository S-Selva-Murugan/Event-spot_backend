const { validationResult } = require("express-validator");
const BookingModel = require("../models/booking-model");
const EventModel = require("../models/event-model");
const ProfileModel = require("../models/profile-model")
const moment=require("moment")
const cron = require("node-cron")

const bookingCltr = {};

bookingCltr.createBooking = async (req, res) => {
    const { eventId } = req.params;
    const { tickets } = req.body;

    try {
        console.log(eventId,"eventId")
        const profile = await ProfileModel.findOne({userId : req.user.id})
        if(!profile) await new ProfileModel().save()
        const event = await EventModel.findById({_id:eventId})
        if (!event) {
            return res.status(404).json({ error: 'Cannot find the Event' });
        }
        console.log(event,"i am event")

        // Transform the incoming tickets array to match the BookingModel structure
        const transformedTickets = tickets.map(ticket => ({
            ticketId: ticket._id,
            ticketType: ticket.ticketName,  // Assuming _id is the reference to EventModel
            quantity: ticket.Quantity,
            ticketPrice: ticket.ticketPrice,
            totalAmount: ticket.ticketPrice * ticket.Quantity, // Include totalAmount for each ticket
        }));
        const totalAmount = transformedTickets.reduce((total, ticket) => total + (ticket.ticketPrice * ticket.Quantity), 0);

        // Check if there are enough available seats for the specified ticket types
        const availableSeats = transformedTickets.every(ticket => {
            const matchingTicket = event.ticketType.find(eventTicket => eventTicket.ticketName === ticket.ticketType);

            if (!matchingTicket) {
                return false; // Ticket not found in the event.ticketType array
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
        });

        const updatedTicketTypes = event.ticketType.map(eventTicket => {
            const matchingTicket = transformedTickets.find(ticket => ticket.ticketType === eventTicket.ticketName);

            if (matchingTicket) {
                // Subtract the booked quantity from the remaining tickets
                eventTicket.remainingTickets -= matchingTicket.quantity;

            }

            return eventTicket;
        });

const eventUpdate = await EventModel.findByIdAndUpdate(eventId, {
    ticketType: updatedTicketTypes,
}, { new: true })

await booking.save()

const updatedEvent = await EventModel.findById(eventId).populate({
    path: "organiserId",
    select: "_id username email"
}).populate({
    path: "categoryId",
    select: "name"
}).populate({
    path: 'reviews',
    populate: {
        path: 'userId',
        model: 'UserModel',
        select: '_id username email'
    }
})


return res.status(201).json({ booking, updatedEvent })
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
        // .populate({
        //     path: 'tickets',
        //     populate: {
        //         path: 'ticketId',
        //         model: 'EventModel',
        //         select: '_id ticketName ticketPrice'
        //     }
        // })

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


async function cancelBookingFunction(eventId){
    try{
        const event = await EventModel.findById(eventId)
        const updatedTicketTypes = event.ticketType.map(eventTicket=>{
            const matchingTicket = booking.tickets.find(ticket=>ticket.ticketType === eventTicket.ticketName)
            if(matchingTicket){
                eventTicket.remainingTickets += matchingTicket
            }
            return eventTicket
        })
    
        const updatedEvent = await EventModel.findByIdAndUpdate(eventId,{
            ticketType : updatedTicketTypes
        },{new:true})
    
        return updatedEvent

    }catch(err){
        console.log(err)
        res.status(500).json(err)
    }
}

// cron.schedule('* * * * *',async()=>{
//     try{
//         const bookingToCancel = await BookingModel.find({status:false})

//         bookingToCancel.forEach(async booking=>{
//             await cancelBookingFunction(booking._id)
//         })
//     }catch(err){
//         console.log("Error in the cancel booking in cron",err)
//     }
// })
cron.schedule("0 0 * * *",()=>{
    //send the msg to the user of the booked event in the email
})
///write a logic in the FE and show Timer of the 5 min if the times exists more then, call canelPayment and also add button to the says cancel payment
bookingCltr.cancelBooking = async (req, res) => {
    const { bookingId } = req.params //send the form front end 
    try {
        const booking = await BookingModel.findOne({ _id: bookingId, userId: req.user.id })
        //check the if the payment is create for this user and ticket if that sucess then say payment done


        //in the backend if the booking are created and not yet confirmed within 10 min auto cancel the booking

        if (!booking) {
            return res.status.json(404).json(bookedEvent)
        } else if (booking.status === true) {
            return res.status.json(200).json({ bookedEvent: bookedEvent.tickets, message: "You have already booked" })
        } else {
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



module.exports = bookingCltr