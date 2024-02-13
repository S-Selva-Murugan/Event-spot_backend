require("dotenv").config()

const express = require("express")
const cors = require("cors")
const { checkSchema } = require("express-validator")
const morgan = require('morgan');

const db = require("./config/db")

const app = express()

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
const bookingCltr = require("./app/controllers/booking-Cltr")
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

const {eventUpload,profileUpload} = require("./app/utils/S3/file-hanlding")



const { userLoginSchema, userRegSchema, userUpdatePassword ,userForgotPassword} = require("./app/validations/user-validation")
const categoryValidationSchema = require("./app/validations/category-validation")
const { profileSchema } = require("./app/validations/profile-validation")
const {reviewSchema} = require("./app/validations/review-validation")
const {validatedRequest,validateFiles,validatedEditRequest} = require("./app/validations/event-validation");

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

//user cannot delete the profile but i have written the cltr

//event ApiS
app.post('/api/getAddress')
// 
app.post("/api/event",authenticateUser,eventUpload.fields([{ name: 'ClipFile', maxCount: 1 },{ name: 'BrochureFile', maxCount: 1 }]),validateFiles,validatedRequest,eventCltr.create)
app.get("/api/paginate/event",eventCltr.paginate)
app.put("/api/event/:eventId",authenticateUser,eventCltr.update)

app.get("/api/event/:eventId",eventCltr.getOne)
app.put('/api/event/approve/:eventId', eventCltr.approveEvent);
app.put('/api/event/cancel-approve/:eventId', eventCltr.cancelApprovalEvent)
app.get('/api/event',eventCltr.getAll)

app.delete("/api/event/:eventId")

//get all the events based on the radius
app.get("/api/event/:radius/:userlon/:userlat", eventCltr.getRadiusValueEvent)
app.post("/api/reversecoding")


//find the distance btw user and the event
app.get("/api/event/:userId/:eventId", eventCltr.distanceAmongThem)

//Booking Api S
app.post("/api/event/:eventId/booking",authenticateUser, bookingCltr.createBooking)
app.get("/api/ticket/:bookedId",authenticateUser,bookingCltr.TicketsInfo)
app.delete("/api/booking/:bookingId",authenticateUser,bookingCltr.cancelBooking)
app.get("/api/get/false/bookings",authenticateUser,bookingCltr.getAllBookings)

//Payment APIs
app.post("/api/booking/:bookingId/payment",authenticateUser,paymentCltr.paymentCheckoutSession)
app.put("/api/booking/update-payment",authenticateUser,paymentCltr.updatedPayment)
app.delete("/api/delete-payment/:paymentId",authenticateUser,paymentCltr.deletePayment)

// Review the Event
app.post("/api/event/:eventId/review",authenticateUser,authorizeUser(['Customer']),checkSchema(reviewSchema),reviewCltr.create)
app.put("/api/event/:eventId/review/:reviewId", authenticateUser, authorizeUser(['Customer']), checkSchema(reviewSchema), reviewCltr.update);
app.delete("/api/event/:eventId/review/:reviewId", authenticateUser, authorizeUser(['Customer']), reviewCltr.delete);



//category APIs
app.post("/api/category",authenticateUser, authorizeUser(["Admin"]), checkSchema(categoryValidationSchema),categoryCltr.create)
app.get("/api/categoryall", categoryCltr.getAll)
app.get("/api/category/:categoryId", categoryCltr.getOne)// check 
app.put("/api/category/:categoryId", authenticateUser, authorizeUser(["Admin"]), checkSchema(categoryValidationSchema), categoryCltr.update)
app.delete("/api/category/:categoryId", authenticateUser, authorizeUser(["Admin"]), categoryCltr.delete)


//Admin API_S
app.get("/api/dashboard",adminCltr.getAggregate)


app.listen(process.env.PORT, () => {


    console.log("Server running on the PORT", process.env.PORT)
})



