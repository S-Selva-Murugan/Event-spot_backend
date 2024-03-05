require("dotenv").config()

const express = require("express")
const cors = require("cors")
const { checkSchema } = require("express-validator")
const morgan = require('morgan')
const cron  = require('node-cron')

const db = require("./config/db")


const app = express()
///connect to the db
db()



app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(cors())
app.use(express.static("public")) // public visible when in local file
// app.use(morgan('combined'))

const usercltr = require("./app/controllers/user-cltr") 
const eventCltr = require("./app/controllers/event-Cltr")
const categoryCltr = require("./app/controllers/category-Cltr")
const profileCltr = require("./app/controllers/profile-Cltr")
const {bookingCltr, cancelBookingFunction} = require("./app/controllers/booking-Cltr")
const paymentCltr = require("./app/controllers/payment-Cltr")
const adminCltr = require("./app/controllers/admin-Cltr")
const reviewCltr = require("./app/controllers/review-Cltr")

const { authenticateUser, authorizeUser } = require("./app/middleware/auth")
const { decodeAddress, decodeLatLng } = require("./app/utils/decodeAddress")

//setting up the multer middleware
// const multer = require('multer')

// const path = require("path")

// const storage = multer.diskStorage({
//     destination:(req,file,cb)=>{
//         cb(null,'uploads/images')
//     },
//     filename:(req,file,cb)=>{
//         const uniqueDateName = `${Date.now() }__${file.originalname}`
//         cb(null,uniqueDateName)
//     }   
// })

// const staticpath = path.join(__dirname,"/uploads")
// app.use("/uploads", express.static(staticpath))
// const upload = multer({ storage: storage })

const {eventUpload,profileUpload, categotyUpload} = require("./app/utils/S3/file-hanlding")



const { userLoginSchema, userRegSchema, userUpdatePassword ,userForgotPassword} = require("./app/validations/user-validation")
const categoryValidationSchema = require("./app/validations/category-validation")
const { profileSchema } = require("./app/validations/profile-validation")
const {reviewSchema} = require("./app/validations/review-validation")
const ticketValidationSchema = require("./app/validations/booking-validation")
const {validatedRequest,validateFiles,validatedEditRequest} = require("./app/validations/event-validation");
const { nodeCronCltr } = require("./app/controllers/node-cron-Cltr");

const BookingModel = require("./app/models/booking-model")
const {ticketValidationMiddleware, validateTicketData} = require("./app/validations/booking-validation")


///cron 
nodeCronCltr() 
// cron.getTasks() to get the list of schedule

//user APIs
app.post("/api/user/register", checkSchema(userRegSchema), usercltr.register)
app.post("/api/user/login", checkSchema(userLoginSchema), usercltr.login)
app.put("/api/user/updatepassword", authenticateUser, usercltr.updatePassword)
app.get("/api/users", authenticateUser, authorizeUser(["Admin"]), usercltr.getAll)
app.put("/api/users/:userId", authenticateUser, authorizeUser(["Admin"]), usercltr.deactivate)

//Deactivate the user cltr 


//Forgot password
app.post("/api/user/forgot-password",checkSchema(userForgotPassword),usercltr.forgotPassword)
app.post("/api/reset-password/:id/:token",usercltr.resetPassword)

// Profiles Info APIs
app.post("/api/profile",authenticateUser, profileUpload.single("profilePic"),checkSchema(profileSchema), profileCltr.create)
app.get("/api/profile",authenticateUser, profileCltr.getOne)
app.put("/api/profile", profileUpload.single("profilePic"),authenticateUser,profileCltr.update)
app.get("/api/profile-all",authenticateUser,authorizeUser(['Admin']),profileCltr.getAll)

//user cannot delete the profile but i have written the cltr

//event ApiS
app.post('/api/getAddress')
 
app.post("/api/event",authenticateUser,authorizeUser(['Organiser']),eventUpload.fields([{ name: 'ClipFile', maxCount: 1 },{ name: 'BrochureFile', maxCount: 1 }]),validateFiles,validatedRequest,eventCltr.create)
app.get("/api/paginate/event",eventCltr.paginate)
app.put("/api/event/:eventId",authenticateUser,authorizeUser(['Organiser']),eventCltr.update)

app.get("/api/event/:eventId",eventCltr.getOne)
app.put('/api/event/approve/:eventId', eventCltr.approveEvent);
app.put('/api/event/cancel-approve/:eventId', eventCltr.cancelApprovalEvent)
app.get('/api/event',eventCltr.getAll)
app.get('/api/org-stats',eventCltr.mostPopularEvent)

app.get(`/api/ssp`,eventCltr.ssp)
app.get('/api/address',eventCltr.getByCity)

app.delete("/api/event/:eventId")

//get all the events based on the radius
app.get("/api/event/:radius/:userlon/:userlat", eventCltr.getRadiusValueEvent)
app.post("/api/reversecoding")


//find the distance btw user and the event
app.get("/api/event/:userId/:eventId", eventCltr.distanceAmongThem)


//get all the organiser Events 
app.get("/api/organiser-events",authenticateUser,eventCltr.getOrganiserEvents)


//Booking Api S
app.post("/api/event/:eventId/booking",authenticateUser,authorizeUser(['Customer']),ticketValidationMiddleware,validateTicketData,bookingCltr.createBooking)
app.get("/api/ticket/:bookedId",authenticateUser,bookingCltr.TicketsInfo)
app.delete("/api/booking/:bookingId",authenticateUser,authorizeUser(['Admin']),bookingCltr.cancelBooking)
app.get("/api/get/false/bookings",authenticateUser,bookingCltr.getAllBookings)

//get the all booking based on the eventId
app.get('/api/booked-users',authenticateUser,authorizeUser(['Admin','Organiser']),bookingCltr.bookedUsers)


//Payment APIs
app.post("/api/booking/:bookingId/payment",authenticateUser,paymentCltr.paymentCheckoutSession)
app.put("/api/booking/update-payment",authenticateUser,paymentCltr.updatedPayment)
app.delete("/api/delete-payment/:paymentId",authenticateUser,paymentCltr.deletePayment)

// Review the Event
app.post("/api/event/:eventId/review",authenticateUser,authorizeUser(['Customer',"Organiser"]),checkSchema(reviewSchema),reviewCltr.createReviewForEvent)
app.put("/api/event/:eventId/review/:reviewId", authenticateUser, authorizeUser(['Customer',"Organiser"]), checkSchema(reviewSchema),reviewCltr.updateReviewForEvent);
app.delete("/api/event/:eventId/review/:reviewId", authenticateUser, authorizeUser(['Customer',"Organiser"]),reviewCltr.deleteReviewForEvent )



//category APIs
app.post("/api/category",authenticateUser, authorizeUser(["Admin"]),categotyUpload.single("categoryImage"), checkSchema(categoryValidationSchema),categoryCltr.create)
app.get("/api/categoryall", categoryCltr.getAll)
app.get("/api/category/:categoryId", categoryCltr.getOne)// check 
app.put("/api/category/:categoryId", authenticateUser, authorizeUser(["Admin"]),categotyUpload.single("categoryImage"), checkSchema(categoryValidationSchema), categoryCltr.update)
app.delete("/api/category/:categoryId", authenticateUser, authorizeUser(["Admin"]), categoryCltr.delete)
app.get("/api/category",categoryCltr.getAllCatAndEvents)
app.get("/api/category/:categoryId",categoryCltr.getByCatId)


//Admin API_S
app.get("/api/dashboard",adminCltr.getAggregate)


app.listen(process.env.PORT, () => {
    console.log("Server running on the PORT", process.env.PORT)
})


//send the msg to the user for booked event
cron.schedule("0 0 * * *", async () => {
    try {
        // find bookings with eventStartDateTime within the next 5 minutes in the events
        const currentDateTime = new Date()
        const futureDateTime = new Date(currentDateTime.getTime() + 5 * 60000)// 5 min  now converting into milli to sec
        const bookings = await BookingModel.find().populate({
            path: 'eventId',
            match: {
                'eventStartDateTime': { $lte: futureDateTime }
            },
            select: 'eventStartDateTime' // populate  the eventStartDateTime 
        }).populate({
            path: 'userId',
            select: 'email'
        });

        // filter out bookings where eventId.eventStartDateTime is less than or equal to futureDateTime
        const filteredBookings = bookings.filter(booking => booking.eventId !== null)


        filteredBookings.forEach(async (booking) => {
            const userEmail = booking.userId.email
            const eventStart = booking.eventId.eventStartDateTime //  eventStartDateTime from populated eventId
            const eventTitle = booking.eventId.title

            await funEmail({
                email: userEmail,
                subject: `Event Reminder: ${eventTitle}`,
                message: `Your event "${eventTitle}" starts in 5 minutes at ${eventStart}.`
              })

            
            console.log(`Reminder email sent to ${userEmail}`);
        });
    } catch (error) {
        console.error('CronError : sending email reminders:', error)
    }
})
//deleting the booking because of false booking and not paid
cron.schedule('*/5 * * * *',async()=>{
    try{
        const bookingToCancel = await BookingModel.find({status:false})

        const currentTime = new Date()

        //iterate thorugh the each booking and check if that differenece is greater than 5 min then cancel it (1000 * 60)=> milli sec to minutes
        for(const booking of bookingToCancel){
            const timeDifference = Math.floor((currentTime-new Date(booking.createdAt))/1000*60)

            if(timeDifference >=5){
                await cancelBookingFunction(booking._id)
            }
        }
    }catch(err){
        console.log("Error in the cancel booking in cron",err)
    }
})

// cron.schedule(' * * * * * *',()=>{
//     console.log("Running",new Date())
// })







