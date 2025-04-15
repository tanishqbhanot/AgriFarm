const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const fieldSchema = new Schema({
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  centroid: {
    latitude: {
      type: Number,
      required: true
    },
    longitude: {
      type: Number,
      required: true
    }
  },
  length: {
    type: Number, 
    required: true
  },
  breadth: {
    type: Number, 
    required: true
  },
  crop: {
    type: String,
    required: true
  },
  lastNPKApplication: {
    type: Date
  },
  lastUreaApplication: {
    type: Date
  },
  lastLimeApplication: {
    type: Date
  },
  irrigationFrequency: {
    type: Number, 
    required: true
  },
  technicalDetails: {
    soilType: String,
    phLevel: Number,
    moistureRetention: String,
    organicContent: String,
    notes: String
  }
}, { timestamps: true });

module.exports = mongoose.model('Field', fieldSchema);
