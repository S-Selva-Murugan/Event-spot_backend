const CategoryModel = require("../models/category-model")

const categoryValidationSchema = {
    
    categoryImage: {

        custom: {
            options: async function (value, { req }) {
                console.log(req.body,"body")
                if (!req.file) {
                    throw new Error("Please upload a category Image");
                }
    
                const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
                console.log('Uploaded file MIME type:', req.file.mimetype);
    
                if (!allowedTypes.includes(req.file.mimetype)) {
                    console.log(req.file.mimetype,"in if")
                    throw new Error('Picture should be in these formats: ' + allowedTypes.join(', '));
                }
    
                return true
            }
        }
    },
    category:{
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