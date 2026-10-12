import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
  userId: String,
  orderId: {
    type: String,
    unique: true,
    required: true
  },
  planName: String,
  amount: String,
  currency: String,
  status: String,
  captureId: String,
}, { timestamps: true });
const Payment=mongoose.model("Payment",paymentSchema)
export default Payment