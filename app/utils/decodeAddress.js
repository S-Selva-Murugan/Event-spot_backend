require("dotenv").config();
const _ = require("lodash");
const axios = require("axios");

const decodeAddress = async (req, res, next) => {
    const body = _.pick(req.body, ['building', 'locality', 'city', 'state', 'pincode', 'country']);
   
    const searchString = encodeURIComponent(`${req.body.building}, ${req.body.locality}, ${req.body.city}, ${req.body.state}, ${req.body.pincode}, ${req.body.country}`);
    console.log(searchString, "data");
    try {
        const mapResponse = await axios.get(`https://api.geoapify.com/v1/geocode/search?text=${searchString}&apiKey=${process.env.GEO_APIFY_KEY}`);

        if(mapResponse.data.features.length==0){
            return  res.status(400).json({errors:[{msg:"Invalid address",path:'invalid address'}]})
         }
         const location = [mapResponse.data.features[0].properties.lon,mapResponse.data.features[0].properties.lat]
        //  console.log(location,"I am location")
        next();
    } catch (err) {
        console.error(err);
        return res.status(500).json(err);
    }
};

const decodeLatLng = async(req,res,next)=>{
    const body = _.pick(req.body,["lattitude","longitude"])
    try{                                                                                         
        const addressResponse = await axios.get(`https://api.geoapify.com/v1/geocode/reverse?lat=${parseInt(req.body)}&lon=${parseInt(req.body)}&apiKey=${process.env.GEO_APIFY_KEY}`)
        const feature = addressResponse.data.features[0];
             
        // console.log(addressResponse)
        const addressDetails = {
            Name:feature.properties.name,
            Country:feature.properties.country,
            Address: feature.properties.formatted,
            Latitude: feature.geometry.coordinates[1],
            Longitude: feature.geometry.coordinates[0]
        }
        console.log(addressDetails,"I am address")
        next()

    }catch(err){
        console.log(err)
    }

}

module.exports = {decodeAddress,decodeLatLng};
