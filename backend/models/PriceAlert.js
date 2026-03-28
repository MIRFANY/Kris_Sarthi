import mongoose from "mongoose";

const priceAlertSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  commodity: String, // "Wheat", "Rice", etc.
  targetPrice: Number, // Alert when price reaches this
  state: String, // "Punjab", "Haryana", etc.
  isActive: {
    type: Boolean,
    default: true,
  },
  notificationsSent: Number,
  lastPriceCheck: Date,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("PriceAlert", priceAlertSchema);