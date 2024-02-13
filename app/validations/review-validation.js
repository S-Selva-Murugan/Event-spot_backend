const {body} = require("express-validator")


const reviewValidationSchemaObject = ()=>[
    body('userId').isMongoId().notEmpty,
    body('title').isString().notEmpty().isLength({min:1,max:255}),
    body('body').isString().notEmpty(),
    body('rating').isString().notEmpty()
]


const reviewValidationSchema = ()=>[
    body('reviews').isArray().notEmpty(),
    ...reviewValidationSchemaObject()
]


module.exports = {reviewSchema:reviewValidationSchema}
     