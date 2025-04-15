const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  address: String,
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  fieldIds: [{
    type: Schema.Types.ObjectId,
    ref: 'Field'
  }]
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
