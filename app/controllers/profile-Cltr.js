require("dotenv").config()
const ProfileModel = require("../models/profile-model")
const _ = require("lodash")
const { validationResult } = require("express-validator")
const axios = require("axios")
const geolib = require('geolib')

async function distanceBtwThem(source, dest) {
    const distanceInMeters = geolib.getDistance(source, dest);
    const distanceInKilometers = distanceInMeters / 1000; // Convert meters to kilometers
    return distanceInKilometers+"km";
}
async function getCoByGeoCode(data,res){
    try{
    const addressResponse =await axios.get(`https://geocode.maps.co/search?q=${data}&api_key=${process.env.GEO_CODE_API_KEY}`)
    if(addressResponse.data.length===0){
        return res.status(404).json({error:"Please give the correct Name of the place check if miss spell or try give another nearer location"})
    }
    return addressResponse.data
    }catch(err){
        console.log(err)
        return res.status(404).json(err)
    }
}

const profileCltr = {}

profileCltr.create = async (req, res) => {
    console.log(req.body)

    const error = validationResult(req)
    if(!error.isEmpty()){
        return res.status(400).json(error)
    }
    const body = _.pick(req.body,["description","address","lonlat","city"])
    try {
        const profile = new ProfileModel({
        userId:req.user.id,
        profilePic: req.file.key,
        description: body.description,
        addressInfo: {
            address: body.address,
            city: body.city
        },
        location : {
            type: "Point",

            coordinates: [body.lonlat.lon, body.lonlat.lat]
        },
      })
  
        await profile.save()
      const result = profile.populate("userId")
        return res.status(200).json(result) 
    } catch (error) {
      console.error('Error creating profile:', error)
      return res.status(500).json(error);
    }
  }


  profileCltr.update = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log(errors);
        return res.status(400).json(errors);
    }

    const body = _.pick(req.body, ["description", "address", "lonlat", "city"]);

    try {
        const updatedProfile = {
            userId: req.user.id,
            description: body.description || '',
            addressInfo: {
                address: body.address || '',
                city: body.city || ''
            },
            location: {
                type: "Point",
                coordinates: [body?.lonlat?.lon || 0, body?.lonlat?.lat || 0]
            }
        };

        if (req.file) {
            updatedProfile.profilePic = req.file.key;
        }

        const profile = await ProfileModel.findOneAndUpdate(
            { userId: req.user.id },
            updatedProfile,
            { new: true }
        );

        if (!profile) {
            return res.status(404).json({ error: 'Profile not found' });
        }

        const result = await profile.populate("userId")

        return res.status(200).json(result);
    } catch (error) {
        console.error('Error updating profile:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};



profileCltr.getAll=async(req,res)=>{

    const search = req.query.search || null
    // console.log(search,"search")
    const searchQuery = {username : { $regex: search,$options:"i" }}


    try{
        let allProfile
        if(search){
            let allProfileif=await ProfileModel.find().populate({
                path:"userId",
                match:searchQuery
            }).sort({createdAt:-1})

            // console.log("running the if")

            if(allProfileif.length > 0 ){
                const filteredProfiles = allProfileif.filter(profile => profile.userId !== null)
                if(filteredProfiles.length > 0) allProfile = filteredProfiles
            } 
        }else if(search === null){
            let allProfileElse=await ProfileModel.find().populate("userId").sort({createdAt:-1})
            // console.log("running the else")
            allProfile = allProfileElse
        }
        
        if(allProfile?.length > 0 ){
            const finalProfile = allProfile.filter((profile) => {
                // console.log(req.user.id,profile.userId._id.toString(),"id")
                return profile.userId._id.toString() !== req.user.id;
            })
            if(finalProfile?.length > 0) allProfile = finalProfile

        }
        
        
            

        res.status(200).json(allProfile)
    }catch(err){
        console.log(err)
        res.status(500).json(err)
    }
}

profileCltr.getOne = async (req, res) => {

    try {
        // Find the profile by profileId and ensure it belongs to the authenticated user
        const profile = await ProfileModel.findOne({ userId: req.user.id })
        .populate("userId")
        .populate("bookings")
        .populate(
            {
             path:"bookings",
             populate:{
             path:"eventId",
             
             model:"EventModel",
             select:"_id title eventStartDateTime location" 
            },
            options: {
                sort: { createdAt: -1 }
            }
        })

        // console.log(profile," i am prfile")
        // const newProfile = profile.
        // for(const eventKey in profile.bookings.eventId){
        //     console.log(eventKey.addressInfo.location,"location")
        // }
        const array = await Promise.all(profile.bookings.map(async(booking)=>{
            return distanceBtwThem( profile.location.coordinates, booking.eventId.location.coordinates)
        }))
        console.log(array)

        
        if (!profile) {
            // If profile is not found or doesn't belong to the authenticated user
            return res.status(404).json({ error: "Profile not found" });
        } 

        // Return the profile data
        return res.status(200).json(profile);
    } catch (err) {
        console.error(err);
    
        // Handle unexpected errors
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

    
// The user cannot delete his profile but admin can or not
profileCltr.delete=async(req,res)=>{
    try{
        const allProfile= ProfileModel.findOneAndDelete({_id:req.user.id})
        if(!allProfile){
            res.status(404).json({error:"User not found"})
        }
        res.status(200).json({error:allProfile})
    }catch(err){
        console.log(err)
        res.status(500).json(err)
    }
}



module.exports = profileCltr

