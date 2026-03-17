import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "success", "failed"],
    default: "pending",
  },
  retryCount: {
    type: Number,
    default: 0,
  },
  idempotencyKey: {
    type: String,
    required: true,
    unique: true,
  },
}, {
  timestamps: true,
});

const Transaction = mongoose.model("Transaction", transactionSchema);

export default Transaction; 