const Razorpay = require("razorpay");

let client = null;

const getRazorpay = () => {
  if (!client) {
    client = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }
  return client;
};

module.exports = { getRazorpay };
