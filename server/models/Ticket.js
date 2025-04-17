const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  ticketType: { type: String, required: true },
  price: { type: Number, required: true },
  qrCode: { type: String, required: true },
  status: { type: String, enum: ['purchased', 'scanned', 'cancelled'], default: 'purchased' },
  purchaseDate: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Ticket', ticketSchema);