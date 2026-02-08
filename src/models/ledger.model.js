import mongoose, { Schema } from "mongoose";

const ledgerSchema = new Schema(
  {
    transaction: {
      type: Schema.Types.ObjectId,
      ref: "Transaction",
      required: true,
    },
    transactionType: {
      type: String,
      enum: ["Sale", "Purchase"],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    balance: {
      type: Number,
      required: true,
    },
    entityType: {
      type: String,
      enum: ["Customer", "Supplier"],
      required: true,
    },
    entityName: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Add indexes for efficient querying
ledgerSchema.index({ transaction: 1 });
ledgerSchema.index({ entityType: 1, entityName: 1 });
ledgerSchema.index({ createdAt: -1 });

export const Ledger = mongoose.model("Ledger", ledgerSchema);
