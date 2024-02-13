require("dotenv").config();
const mongoose = require("mongoose");

const db = () => {
  mongoose
    .connect(process.env.DB_NAME)
    .then(() => console.log("DB is running"))
    .catch((err) => {
      console.error(err);
      setTimeout(() => {
        db(); // Call the db function recursively to retry connection
      }, 3000);
    });
};

module.exports = db;
