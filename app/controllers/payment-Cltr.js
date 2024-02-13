require("dotenv").config()
const { validationResult } = require("express-validator");
const BookingModel = require("../models/booking-model");
const stripe = require("stripe")(process.env.STRIPE_KEY);
const _ = require("lodash");
const PaymentModel = require("../models/payment-model");
const ProfileModel = require("../models/profile-model");

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
    console.log(bookedEvent)

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
      console.log(bookedEvent,"i am event")
        const totalPaidAmount = bookedEvent.tickets.reduce((acc,cv ) => {
            return acc + cv.totalAmount;
          }, 0);
        console.log(totalPaidAmount)
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
  try{
    console.log("1")
    const payment = await PaymentModel.findOneAndUpdate(
      { transaction_Id: stripeId },
      { status: true },
      { new: true }
    );
        console.log(payment,"paymentInfo")
    if(payment.status === true){
      console.log("2")
      const booking = await BookingModel.findOneAndUpdate({_id:payment.bookingId},{status:true},)
        console.log(booking._id,"id")

        const updatedProfile = await ProfileModel.findOneAndUpdate(
          { userId: req.user.id },
          { $push: { bookings: booking._id } }
        ) 


      res.status(200).json("Payment Successfull", booking.totalAmount,"Rs")
    }
    if(!payment) return res.status(404).json("Cannot find the Payment Info")

  } catch(err){
    console.log(err)
    return res.status(500).json(err)
  }
}

// paymentCltr.updatedPayment = async (req, res) => {
//   const { transactionId } = req.body;
//   try {
//     console.log("1");
//     const payment = await PaymentModel.findOneAndUpdate(
//       { transaction_Id: transactionId },  // Updated variable name
//       { status: true },
//       { new: true }
//     );
//     console.log(payment, "paymentInfo");
//     if (payment && payment.status === true) {
//       console.log("2");
//       const booking = await BookingModel.findOneAndUpdate(
//         { _id: payment.bookingId, userId: req.user.id },
//         { status: true }
//       );
//       console.log(booking);
//       const addBooking = await ProfileModel.findOneAndUpdate(
//         { userId: req.user.id },
//         { $push: { bookings: booking._id } }
//       );
//       console.log(addBooking);

//       console.log("3");

//       res.status(200).json({
//         message: "Payment Successful",
//         totalAmount: booking.totalAmount,
//         currency: "Rs"
//       });
//     } else {
//       return res.status(404).json("Cannot find the Payment Info");
//     }
//   } catch (err) {
//     return res.status(500).json("Payment failed");
//   }
// };



paymentCltr.deletePayment  = async(req,res)=>{
  const {paymentId} = req.params
  try{
    await PaymentModel.findOneAndDelete({userId:req.user.id,transaction_Id:paymentId})
    return res.status(200).json("Somthing went wrong on the payment")
  }catch(err){//write the status code for payments
    return res.json(EvalError)
  }
}



module.exports = paymentCltr;
