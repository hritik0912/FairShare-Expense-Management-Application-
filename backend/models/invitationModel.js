import mongoose from 'mongoose';

const invitationSchema = new mongoose.Schema({
  // The email address the invitation was sent to.
  email: {
    type: String,
    required: true,
    trim: true,
  },
  // The group the user is being invited to join.
  group: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group',
    required: true,
  },
  // The user who sent the invitation.
  invitedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  // The unique token to be included in the invitation link.
  token: {
    type: String,
    required: true,
    unique: true,
  },
  // The date when the invitation token expires.
  expiresAt: {
    type: Date,
    required: true,
  },
  // Status to track if the invitation has been accepted.
  status: {
    type: String,
    enum: ['pending', 'accepted'],
    default: 'pending',
  }
}, {
  timestamps: true, // Adds createdAt and updatedAt timestamps
});

const Invitation = mongoose.model('Invitation', invitationSchema);

export default Invitation;