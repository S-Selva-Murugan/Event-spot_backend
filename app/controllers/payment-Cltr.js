require("dotenv").config()
const { validationResult } = require("express-validator");
const BookingModel = require("../models/booking-model");
const stripe = require("stripe")(process.env.STRIPE_KEY);
const _ = require("lodash");
const PaymentModel = require("../models/payment-model");
const ProfileModel = require("../models/profile-model");
const {cancelBookingFunction} = require("../controllers/booking-Cltr");
const funEmail = require("../utils/NodeMailer/email");

const paymentCltr = {};

paymentCltr.paymentCheckoutSession = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array() });
  } else {
    const body = _.pick(req.body, ["CARD"])

    const { bookingId } = req.params
    console.log(bookingId,"id")
    try {
      
      const bookedEvent = await BookingModel.findOne({ _id: bookingId ,userId:req.user.id})
      console.log(bookedEvent)


      if (!bookedEvent) {
        return res.status(404).json({ error: bookedEvent, message: "Cannot find the booked event" });
      }

      const profile = await ProfileModel.find({userId:req.user.id}).populate("userId")
      // console.log(profile.userId.username)
      const customer = await stripe.customers.create({
        // name: profile.userId.username,
        name:"Event_Spot",
        address: {
            line1: 'India',
            postal_code: '560002',
            city: 'Banglore',
            state: 'KA',
            country: 'US', 
        },
    })

      const session = await stripe.checkout.sessions.create({
        payment_method_types: [body.card],
        mode: "payment",
        line_items: bookedEvent.tickets.map((ticket) => {
          return {
            price_data: {
              currency: "inr",
              product_data: {
                name: ticket.ticketType,
              },
              unit_amount: ticket.ticketPrice * 100, // not done the converting to cents for usd
            },
            quantity: ticket.quantity,
          };
        }),
        customer:customer.id,

        success_url: `${process.env.SERVER_URL}/success`,
        cancel_url: `${process.env.SERVER_URL}/cancel`,
      }); 
        const totalPaidAmount = bookedEvent.tickets.reduce((acc,cv ) => {
            return acc + cv.totalAmount;
          }, 0);
        res.json({id:session.id,url:session.url})

        if(session.id){
          const paymentPending = new PaymentModel({
            userId:req.user.id,
            bookingId:bookingId,
            paymentDate:new Date(),
            amount :totalPaidAmount,
            paymentType:session.payment_method_types[0],
            transaction_Id:session.id
        })
      await paymentPending.save()
        
      }

    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "Internal server error" })
    }
  }
};

paymentCltr.updatedPayment = async(req,res)=>{
  const {stripeId} = req.body
  console.log(stripeId,"id 92")
  try{
    console.log("1")
    const payment = await PaymentModel.findOneAndUpdate(
      { transaction_Id: stripeId },
      { status: true },
      { new: true }
    )
 console.log(payment,"paymentInfo")
    if(payment.status){
      console.log("2")
      const booking = await BookingModel.findOneAndUpdate({_id:payment.bookingId},{status:true},{new:true}).populate("eventId").populate("userId")
        console.log(booking._id,"id")

        const updatedProfile = await ProfileModel.findOneAndUpdate(
          { userId: req.user.id },
          { $push: { bookings: booking._id } }
        ) 

        await funEmail({
          email: booking.userId.email,
          subject: "BOOKING CONFIRMED",
          message: `YOU'R BOOKING IS SUCCESSFULLY ${booking.eventId.title}`
        })

      res.status(200).json("Payment Successfull", booking.totalAmount,"Rs")
    }else{
      if(!payment) return res.status(404).json("Cannot find the Payment Info")
    }



  } catch(err){
    console.log(err)
    return res.status(500).json(err)
  }
}

paymentCltr.deletePayment  = async(req,res)=>{
  const {paymentId} = req.params
  try{
    const paymentData = await PaymentModel.findOneAndDelete({userId:req.user.id,transaction_Id:paymentId},{new:true})
    const DeleteBooking = await cancelBookingFunction(paymentData.bookingId)


    return res.status(200).json("Your booking is Canceled")
  }catch(err){//write the status code for payments
    return res.status(400).json(err)
  }
}



module.exports = paymentCltr
