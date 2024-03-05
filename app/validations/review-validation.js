const reviewValidationSchema =  {
    title:{
        notEmpty:{
            errorMessage:"Title cannot be empty"
        },
        isLength:{
            options:{min:2,max:100},
            errorMessage:"Title cannot be less than 1 and not greater than 100 "
        },
        
    },
    body:{
        notEmpty:{
            errorMessage:"Body cannot be empty"
        },
        isLength:{
            options:{min:2,max:1000},
            errorMessage:"Body cannot be less than 1 and not greater than 1000"
        }
    },
    rating:{
        notEmpty:{
            errorMessage:"Title cannot be empty"
        },
        isFloat:{
            options:{min:0.5,max:5},
            errorMessage:"Rating cannot be less than 0.5 and not greater than 5"
        }
    }
}



module.exports = {reviewSchema:reviewValidationSchema}
     