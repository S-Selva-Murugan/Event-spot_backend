const { validationResult } = require("express-validator")
const UserModel = require("../models/user-model")
const _ = require("lodash")
const bcryptjs = require("bcryptjs")
const jwt = require("jsonwebtoken")
const funEmail = require("../utils/NodeMailer/email")

const userCltr = {}

userCltr.register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array() });
  } else {
    const body = _.pick(req.body, ["username", "email", "password", "number", "role"]);

    try {
      const user = new UserModel(body);
      const salt = await bcryptjs.genSalt();

      const encryptedPwd = await bcryptjs.hash(user.password, salt);
      user.password = encryptedPwd;

      const userCount = await UserModel.countDocuments();

      if (userCount === 0) {
        user.role = "Admin";
      }

      await user.save();
      const { username } = user
      return res.status(201).json(username);
    } catch (err) {
      console.error(err);
      return res.status(500).json(err);
    }
  }
};

///deactive the account need to be done
userCltr.login = async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array() })
  } else {
    const body = _.pick(req.body, ["email", "password"])
    try {
      const user = await UserModel.findOne({ email: body.email })
      if (!user) {
        return res.status(400).json({ error: "invalid email/password" })
      }
      const result = await bcryptjs.compare(body.password, user.password)
      if (!result) {
        return res.status(400).json("invalid email/password")
      }
      await funEmail({
        email: user.email,
        subject: "LOGIN STATUS",
        message: "YOU'R LOGIN IS SUCCESSFULLY"
      })
      if (user.isActive) {
        const tokenData = {
          id: user._id,
          role: user.role
        }
        const token = jwt.sign(tokenData, process.env.JWT_SECRET, { expiresIn: "7d" })
        res.status(200).json({ token })

      } else {
        return res.status(403).json("You'r account is blocked by Admin")
      }


    } catch (err) {
      console.log(err)
      return res.status(500).json(err)
    }
  }
}




userCltr.updatePassword = async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors })
  } else {
    const body = _.pick(req.body, ["newPassword", "changePassword"])

    try {
      if (body.newPassword === body.changePassword) {
        const tempUser = await UserModel.findOne(req.user.id) //check its one or id

        if (!tempUser) {
          return res.status(404).json({ error: "User not found" })
        }

        const salt = await bcryptjs.genSalt();
        const encryptedPwd = await bcryptjs.hash(body.changePassword, salt)

        const user = await UserModel.findOneAndUpdate(
          { _id: req.user.id },
          { password: encryptedPwd },
          { new: true }
        );

        return res.status(200).json(user);
      } else {
        return res.status(400).json({ error: "New passwords do not match" })
      }
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "Internal Server Error" })
    }
  }
};




userCltr.getAll = async (req, res) => {
  try {
    const users = await UserModel.find()
    return res.status(200).json(users)
  } catch (err) {
    console.log(err)
    return res.status(500).json(err)


  }
}

///check userCltr.forgotPassword

userCltr.forgotPassword = async (req, res) => {
  const { email } = req.body
  try {

    const user = await UserModel.findOne({ email: email })
    if (!user) return res.status(404).json({ err: "Email not found" })

    const genToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "10min"
    })
    emailData = {
      email: user.email,
      subject: "EVENT_SPOT@ <support> Password Change",
      message: `Click here to reset your password ${process.env.SERVER_URL}/resetPassword/${user._id}/${genToken}`

    }
    await funEmail(emailData)
 
    res.status(200).json({ status: "success", msg: "sent success " })
  } catch (err) {
    console.log(err)
    return res.status(500).json(err)
  }

}


userCltr.resetPassword = async (req, res) => {
  const { password } = req.body

  const { id, token } = req.params

  try {
    const decrypt = jwt.verify(token, process.env.JWT_SECRET)

    const salt = await bcryptjs.genSalt()
    const encryptedPwd = await bcryptjs.hash(password, salt)

    await UserModel.findByIdAndUpdate(id, { password: encryptedPwd })
    return res.status(200).json({ msg: "Successfully changed the password" })
  } catch (err) {
    console.log(err)
    if (err.name === "TokenExpriedError") {
      return res.status(401).json({ status: 'error', msg: "Token has expried" })
    }
    return res.status(500).json(err)
  }
}




userCltr.deactivate = async (req, res) => {
  const { userId } = req.params; // Correctly retrieve userId from request parameters
  try {
    const user = await UserModel.findById(userId);
    if (!user) return res.status(404).json({ err: "User Not Found" });
    const userUpdate = await UserModel.findByIdAndUpdate(userId, { isActive: false }, { new: true });
    return res.status(200).json({ message: `${user.username} account isActive changed to ${userUpdate.isActive}` });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};






module.exports = userCltr