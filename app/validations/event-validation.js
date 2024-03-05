const Joi = require('joi')



const schema = Joi.object({
  eventStartDateTime: Joi.date().greater(Joi.ref('ticketSaleStartTime')).required(),
  eventEndDateTime:Joi.date().greater(Joi.ref("eventStartDateTime")).required(),
  title: Joi.string().required(),
  description: Joi.string().required(),
  venueName: Joi.string().required(),
  ticketSaleStartTime: Joi.date().iso().required(),
  ticketSaleEndTime: Joi.date().iso().required(),
  categoryId: Joi.string().hex().length(24).required(),
  ticketType: Joi.array().items(
    Joi.object({
      ticketName: Joi.string().required(),
      ticketPrice: Joi.number().required(),
      ticketCount: Joi.number().integer().required(),
      remainingTickets: Joi.number().integer().required()
    })
  ).required(),
  Actors: Joi.array().items(
    Joi.object({
      name: Joi.string().required()
    })
  ).required(),
  ClipName: Joi.string().required(),
  BrochureName: Joi.string().required(),
  youTube: Joi.object({
    title: Joi.string().required(),
    url:  Joi.string().required()   
    // .uri().
  }).required(),
  addressInfo: Joi.object({
    address: Joi.string().required(),
    city: Joi.string().required()
  }).required(),
  location: Joi.object({
    lon: Joi.number().required(),
    lat: Joi.number().required()
  }).required(),

});



const validatedRequest = (req,res,next)=>{
   
    const {error} = schema.validate(req.body)
    if(error){
        res.status(400).send(error.details[0].message)
    }else{
        next()
    }
}

const validateFiles = (req,res,next)=>{
    if(!req.files ){
        return res.status(400).send("Add the Files to the in the Clip and Brochure")
    }
    next()
}

const editEventSchema = Joi.object({
  title: Joi.string().trim().required(),
  eventStartDateTime: Joi.string().isoDate().required(),
  description: Joi.string().trim().required(),
  ticketSaleStartTime: Joi.string().isoDate().required(),
  ticketSaleEndTime: Joi.string().isoDate().required(),
  venueName: Joi.string().trim().required(),
  ticketType: Joi.array().items(Joi.object({
    ticketName: Joi.string().trim().required(),
    ticketPrice: Joi.number().min(0).required(),
    ticketCount: Joi.number().min(0).required(),
  })).required(),
  youTube: Joi.object({
    title: Joi.string().trim().required(),
    url: Joi.string().uri().required(),
  }).required(),
  actors: Joi.array().items(Joi.object({
    name: Joi.string().trim().required()
  })).required(),
  // Add more fields as needed
});

// Function to validate form data

const validatedEditRequest = (req,res,next)=>{
   console.log(req.body)
  const {error} = editEventSchema.validate(req.body)
  if(error){
      res.status(400).send(error.details[0].message)  
  }else{
      next()
  }
}

module.exports = {validatedRequest,validateFiles,validatedEditRequest}

// Use this schema to validate your data


// const ticketTypeSchema = Joi.object({
        
//     ticketName:Joi.string().required(),
    
//     ticketPrice:Joi.number().required(),
    
//     ticketCount:Joi.number().required(),

// })

// const actorSchema = Joi.object({
//     name:Joi.string().required()
// })

// const youTubeSchema = Joi.object({
//     title:Joi.string().required(),
//     url:Joi.string().required()
// })

// const addressInfoSchema = Joi.object({
//    address:Joi.string().required(),
//     city:Joi.string().required()

// })

// const locationSchema=Joi.object({
//     lon:Joi.string().required(),
//     lat:Joi.string().required()
// })

// const eventSchema = Joi.object({

//     eventStartDateTime:Joi.date().required(),

//     title:Joi.string().required(),
    
//     description:Joi.string().required(),
    
//     venueName:Joi.string().required(),

//     ticketSaleStartTime:Joi.date().required(),
   
//     ticketSaleEndTime:Joi.date().required(),

//     categoryId:Joi.array().items(Joi.string().required()),

//     ticketType:Joi.array().items(ticketTypeSchema).required(),

//     actors :Joi.array().items(actorSchema).required(),

//     ClipName:Joi.string().required(),

//     BrochureName:Joi.string().required(),

//     youTube: youTubeSchema.required(),

//     addressInfo: addressInfoSchema.required(),

//     location:locationSchema.required()

// })
