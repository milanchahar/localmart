const mongoose = require("mongoose");

const shopSchema = new mongoose.Schema(
  {
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    name: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    coords: {
      lat: { type: Number, default: null },
      lng: { type: Number, default: null },
    },
    isOpen: { type: Boolean, default: true },
    timings: {
      open: { type: String, default: "09:00" },
      close: { type: String, default: "21:00" },
    },
    rating: { type: Number, default: 0 },
    totalRatings: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Shop", shopSchema);
