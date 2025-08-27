import mongoose from 'mongoose';

const subscriptionSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    group: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Group',
      required: true,
    },
    // The user responsible for paying the bill each cycle
    paidBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    // e.g., 'monthly', 'yearly'
    billingCycle: {
      type: String,
      required: true,
      enum: ['daily', 'weekly', 'monthly', 'yearly'], 
      default: 'monthly',
    },
    nextDueDate: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Subscription = mongoose.model('Subscription', subscriptionSchema);

export default Subscription;
