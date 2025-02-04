const CategoryModel = require("../models/category-model")
const EventModel = require("../models/event-model")
const PaymentModel = require("../models/payment-model")
const ProfileModel = require("../models/profile-model")
const UserModel = require("../models/user-model")
const BookingModel = require("../models/booking-model")
const ReviewModel = require("../models/review-model")

const adminCltr = {}

adminCltr.dashboard=async(req,res)=>{
//get all the event which are not Approved

try{
    const event =await EventModel.find({isApproved:false})
    if(!event ){
        res.status(400).json(event)
    }else if(event.length===0){
        res.status(200).json({data:event,message:"All event are approved"})
    }

}catch(err){

    console.log(err)
    res.status(500).json(err)
}


adminCltr.approveTrue  = async(req,res)=>{
    const {id}=body//also make as params
    try{
        const eventApprove = await EventModel.findByIdAndUpdate({_id:id},{isApproved:true},{new:true})
        if(!eventApprove){
            res.status(404).json({data:eventApprove,message:"Event cannot be found"})
        }
        res.status(200).json(eventApprove)

    }catch(err){
        console.log(err)
        res.status(500).json(err)
    }
}

adminCltr.getUser = async(req,res)=>{
    try{
      const userData  = await UserModel.find()
      return res.status(200).json(userData)
    }catch(err){
      console.log(err)
      return res.status(500).json(err)
    }
  }




//get all the revenue
//get all the new customer from today
//get all the events
//get all bookings
//get users map on the dashboard
//get all the organiser
//get the top 10 most purchased event tickets
//get all the user and event can be categories based on the country
//get all the completed events and its stat 
//get the user with type of payment and the currency type

}

adminCltr.getAggregate = async (req, res) => {
    try {
        const dashboard = {
            userInfo:{
                activeUsers: 0,
                notActiveUsers: 0
              },
            totalAmount:0,
            popularEvent:0,
            category:{
                info:0,
                categoryEvents:0
            },
            review:0,
            totalBooking:0,
            avgPerCat:0,
            revenuePerUser:0,
            paymentType:0,
            totalCatPerEvent:0,

        }

        dashboard.totalEventPerOrganiser = await EventModel.aggregate([
          {
            $group: {
              _id: '$organiserId',
              totalEvents: { $sum: 1 }
            }
          },
          {
            $lookup: {
              from: 'UserModel',
              localField: '_id',
              foreignField: '_id',
              as: 'user'
            }
          },
          {
            $project: {
              username: '$user.username',
              totalEvents: 1
            }
          }
        ]);
        

        dashboard.totalCatPerEvent = await EventModel.aggregate([
          {
            $group: {
              _id: '$categoryId',
              totalEvents: { $sum: 1 }
            }
          },
          {
            $lookup: {
              from: 'CategoryModel',
              localField: '_id',
              foreignField: '_id',
              as: 'category'
            }
          },
          {
            $project: {
              categoryName: '$category.name',
              totalEvents: 1
            }
          }
        ]);

        dashboard.paymentType = await PaymentModel.aggregate([
          {
            $group: {
              _id: '$paymentType',
              totalAmount: { $sum: '$amount' }
            }
          }
        ]);
        
        

        dashboard.revenuePerUser = await BookingModel.aggregate([
          {
            $lookup: {
              from: 'UserModel',
              localField: 'userId',
              foreignField: '_id',
              as: 'user'
            }
          },
          {
            $group: {
              _id: '$user.username',
              totalRevenue: { $sum: '$totalAmount' }
            }
          }
        ]);
               
  
      const [activeUsersData, notActiveUsersData] = await Promise.all([
        UserModel.aggregate([
          {
            $match: {
              isActive: true
            }
          },
          {
            $count: "activeUsers"
          }
        ]),
        UserModel.aggregate([
          {
            $match: {
              isActive: false
            }
          },
          {
            $count: "notActiveUsers"
          }
        ])
      ]);
  
      if (activeUsersData.length > 0) {
        dashboard.userInfo.activeUsers = activeUsersData[0].activeUsers;
      }
  
      if (notActiveUsersData.length > 0) {
        dashboard.userInfo.notActiveUsers = notActiveUsersData[0].notActiveUsers;
      }

      const today = new Date()
      today.setHours(0,0,0,0)
      dashboard.totalAmount = await PaymentModel.aggregate([
        {
            $match :{
                paymentDate:{
                    $gte : today,
                    $lt:new Date(today.getTime()+24*60*60*1000)


                }
            }
        },//next pipeline
        {
            $group:{
                _id:null,
                totalAmount:{$sum:"$amount"}
            }
        }
      ])//return a array

      dashboard.popularEvent = await EventModel.aggregate([
        {
          $match: {
              eventStartDateTime: { $lt: new Date() }, // Event has started
              eventEndDateTime: { $gt: new Date() }, // Event has not ended yet
              isApproved:true

          }
      },
        {
            $unwind: "$ticketType" 
        },
        {
            $project: {
                _id: 1,
                title: 1,
                ticketsSold: {
                    $subtract: ["$ticketType.ticketCount", "$ticketType.remainingTickets"]
                }
            }
        },
        {
            $sort: { ticketsSold: -1 }
        },
        {
            $limit: 5
        }
    ])

    dashboard.category.info = await EventModel.aggregate([
        {
            $group:{
                _id:"$categoryId",
                count:{
                    $sum:1
                }
            }
        }
    ])
    dashboard.category.categoryEvents = await CategoryModel.find().populate({
        path:"events" ,select :"title _id eventStartDateTime"
    })

    dashboard.review = await EventModel.aggregate([
        {
        $match :{
            reviews:{$exists :true ,$ne:[]}
                }
        },
        {
            $unwind:"$reviews"
        },{
            $group:{
                _id:null,
                averageRating:{$avg:"$reviews.rating"}
            }
        }
    ])

    dashboard.totalBooking = await BookingModel.aggregate([
      {
        $lookup: {
          from: 'EventModel',
          localField: 'eventId',
          foreignField: '_id',
          as: 'event'
        }
      },
      {
        $group: {
          _id: '$event.title',
          totalBookings: { $sum: 1 }
        }
      }
    ]);

    dashboard.avgPerCat = await EventModel.aggregate([
      {
        $group: {
          _id: '$categoryId',
          averageTicketPrice: { $avg: '$ticketType.ticketPrice' }
        }
      },
      {
        $lookup: {
          from: 'CategoryModel',
          localField: '_id',
          foreignField: '_id',
          as: 'category'
        }
      },
      {
        $project: {
          categoryName: '$category.name',
          averageTicketPrice: 1
        }
      }
    ]);

      return res.json(dashboard);
    } catch (err) {
      console.log(err);
      return res.status(500).json({ error: "Internal server error" });
    }
  };
  

module.exports = adminCltr