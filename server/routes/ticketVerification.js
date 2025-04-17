const express = require('express');
const Ticket = require('../models/Ticket');
const User = require('../models/User');
const auth = require('../middleware/auth');
const router = express.Router();

// Middleware to ensure only organizers can verify tickets
const isOrganizer = async (req, res, next) => {
  if (req.user.role !== 'organizer') {
    return res.status(403).json({ error: 'Access denied: Organizers only' });
  }
  next();
};

router.post('/verify', auth, isOrganizer, async (req, res) => {
  const { ticketData } = req.body;
  try {
    const parsedData = JSON.parse(ticketData);
    const ticket = await Ticket.findOne({
      userId: parsedData.userId,
      eventId: parsedData.eventId,
      ticketType: parsedData.ticketType,
      purchaseDate: parsedData.purchaseDate,
    }).populate('eventId');
    if (!ticket) {
      return res.status(400).json({ error: 'Invalid ticket' });
    }
    const user = await User.findById(parsedData.userId);
    res.json({
      message: 'Ticket verified successfully',
      ticket: {
        userEmail: user.email,
        eventTitle: ticket.eventId.title,
        ticketType: ticket.ticketType,
        purchaseDate: ticket.purchaseDate,
      },
    });
  } catch (err) {
    res.status(500).json({ error: 'Verification failed' });
  }
});

module.exports = router;