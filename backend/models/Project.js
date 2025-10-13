const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  freelancerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  status: {
    type: String,
    enum: ['pending', 'active', 'completed', 'cancelled'],
    default: 'pending'
  },
  priority: {
    type: String,
    enum: ['normal', 'urgent'],
    default: 'normal'
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  deadline: {
    type: Date,
    required: true
  },
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  skills: [{
    type: String,
    required: true
  }],
  category: {
    type: String,
    required: true
  },
  subcategory: {
    type: String
  },
  attachments: [{
    filename: String,
    url: String,
    uploadedAt: { type: Date, default: Date.now }
  }],
  proposals: [{
    freelancerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    proposal: String,
    bidAmount: Number,
    deliveryTime: Number,
    submittedAt: { type: Date, default: Date.now }
  }],
  milestones: [{
    title: String,
    description: String,
    amount: Number,
    dueDate: Date,
    status: {
      type: String,
      enum: ['pending', 'in-progress', 'completed'],
      default: 'pending'
    }
  }],
  rating: {
    clientRating: { type: Number, min: 1, max: 5 },
    freelancerRating: { type: Number, min: 1, max: 5 },
    clientReview: String,
    freelancerReview: String
  },
  completedAt: Date
}, {
  timestamps: true
});

// Populate client and freelancer info
projectSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'clientId',
    select: 'firstName lastName avatar email'
  }).populate({
    path: 'freelancerId',
    select: 'firstName lastName avatar email rating totalProjects'
  });
  next();
});

module.exports = mongoose.model('Project', projectSchema);