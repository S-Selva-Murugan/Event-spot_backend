const { checkSchema } = require('express-validator')
 const profileValidationSchema = {
    // "profilePic","description","addressInfo" 
    profilePic: {

        custom: {
            options: async function (value, { req }) {
                if (!req.file) {
                    throw new Error("Please upload a profile picture");
                }
    
                const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
                console.log('Uploaded file MIME type:', req.file.mimetype);
    
                if (!allowedTypes.includes(req.file.mimetype)) {
                    console.log(req.file.mimetype,"in if")
                    throw new Error('Picture should be in these formats: ' + allowedTypes.join(', '));
                }
    
                return true;
            }
        }
    },
    description: {
        notEmpty: {
          errorMessage: 'Give a valid description or Bio',
        },
        isLength: {
          options: { min: 5, max: 100 },
          errorMessage: 'Description must be between 5 and 100 characters',
        },
      },
      address: {
        notEmpty: {
          errorMessage: 'Address cannot be empty',
        },
        isLength: {
          options: { min: 5, max: 100 },
          errorMessage: 'Address length should be between 5 and 100 characters',
        },
      },
      city: {
        notEmpty: {
          errorMessage: 'City cannot be empty',
        },
        isLength: {
          options: { min: 2, max: 100 },
          errorMessage: 'City length should be more than 2 characters',
        },
      },
      'lonlat.lon': {
        notEmpty: {
          errorMessage: 'Longitude cannot be empty',
        },
        isNumeric: {
          errorMessage: 'Longitude should be numeric',
        },
      },
      'lonlat.lat': {
        notEmpty: {
          errorMessage: 'Latitude cannot be empty',
        },
        isNumeric: {
          errorMessage: 'Latitude should be numeric',
        },
      },
    }

    module.exports = {profileSchema: profileValidationSchema}












