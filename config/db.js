const mongoose = require("mongoose");
require('dotenv').config()

// Replace this with your MONGOURI.
const MONGOURI = process.env.MONGOURI
const MongoServer = async () => {
  try {
    await mongoose.connect(MONGOURI, {
      useNewUrlParser: true,
    });
    console.log("Connected to Database !!");
  } catch (e) {
    console.log(e);
    throw e;
  }
};

module.exports = MongoServer;