const UserModel = require("../models/user-model");

const passwordSchema = {
    isLength: {
        options: { min: 8, max: 128 },
        errorMessage: "Password must be between 8 and 128 characters long"
    },
    notEmpty: {
        errorMessage: "Password is required"
    }
};
const emailSchema = {
        isEmail: {
            errorMessage: "Email must be a valid format"
        },
        notEmpty: {
            errorMessage: "Email cannot be empty"
        }
    
}

const userRegistration = {
    username: {
        notEmpty: {
            errorMessage: "User cannot be empty"
        },
        isLength: {
            options: { min: 1, max: 100 },
            errorMessage: "Username must be between 1 and 100 characters long"
        }
    },
    email: {
        ...emailSchema,
        custom: {
            options: async function(value) {
                const email = await UserModel.findOne({ email: value });
                if (email) {
                    throw new Error("Email is already taken. Please try logging in.");
                } else {
                    return true;
                }
            }
        }
    },
    password: passwordSchema,
    
    role: {
        notEmpty: {
            errorMessage: "Role is required"
        },
        isIn: {
            options: [["Customer", "Organiser"]],
            errorMessage: "Role must be either Customer or Organiser"
        }
    },
    number: {
        notEmpty: {
            errorMessage: "Number cannot be empty"
        },
        isLength: {
            options: { min: 10, max: 10 },
            errorMessage: "Mobile Number should be 10 digits long"
        },
        isNumeric: {
            errorMessage: "Mobile Number should be numeric"
        }
    }
};

const userLogin = {
    email:emailSchema,
    password: passwordSchema
};

const updatePassword = {
    newPassword:passwordSchema,
    changePassword:passwordSchema
}
const forgotPassword = {
    email:emailSchema
}

module.exports = {
    userLoginSchema: userLogin,
    userRegSchema: userRegistration,
    userUpdatePassword:updatePassword,
    userForgotPassword:forgotPassword
};


