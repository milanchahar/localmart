const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    shopId: { type: mongoose.Schema.Types.ObjectId, ref: "Shop", required: true },
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true, unique: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Review", reviewSchema);
