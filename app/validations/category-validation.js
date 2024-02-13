const CategoryModel = require("../models/category-model")

const categoryValidationSchema = {
    name:{
        notEmpty:{
            errorMessage:"Name cannot be empty"
        },
        isLength:{
            options:{min:2,max:10},
            errorMessage:"Category cannot be less than 2 and not greater than 10 "
        }
    }
}

module.exports = categoryValidationSchema