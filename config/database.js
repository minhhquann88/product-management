//Cài Mongoose
const mongoose = require('mongoose');

module.exports.connect = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log('Conect success!!');
  } catch (error) {
    console.log('Connect error!!');
  }
};
