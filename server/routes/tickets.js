const express = require('express');
const Ticket = require('../models/Ticket');
const Event = require('../models/Event');
const User = require('../models/User');
const auth = require('../middleware/auth');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const QRCode = require('qrcode');

// Middleware to ensure only users can buy tickets
const isUser = async (req, res, next) => {
  if (req.user.role !== 'user') {
    return res.status(403).json({ error: 'Access denied: Users only' });
  }
  next();
};

// Middleware to ensure only organizers can verify tickets
const isOrganizer = async (req, res, next) => {
  if (req.user.role !== 'organizer') {
    return res.status(403).json({ error: 'Access denied: Organizers only' });
  }
  next();
};

// Get user's tickets
router.get('/my-tickets', auth, async (req, res) => {
  try {
    const tickets = await Ticket.find({ userId: req.user.id }).populate('eventId');
    res.json(tickets);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get tickets for an event (for organizers)
router.get('/event/:eventId', auth, async (req, res) => {
  try {
    const tickets = await Ticket.find({ eventId: req.params.eventId }).populate('eventId');
    res.json(tickets);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Initiate ticket purchase
router.post('/buy', auth, isUser, async (req, res) => {
  const { eventId, ticketType } = req.body;

  try {
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    const ticketInfo = event.tickets.find(t => t.type === ticketType);
    if (!ticketInfo) {
      return res.status(400).json({ error: 'Ticket type not found' });
    }

    const ticketsSold = await Ticket.countDocuments({ eventId, ticketType, status: 'purchased' });
    if (ticketsSold >= ticketInfo.quantity) {
      return res.status(400).json({ error: 'Tickets sold out' });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: ticketInfo.price * 100,
      currency: 'usd',
      metadata: { eventId, ticketType, userId: req.user.id },
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      ticketData: {
        userId: req.user.id,
        eventId,
        ticketType,
        price: ticketInfo.price,
        purchaseDate: new Date().toISOString(),
      },
    });
  } catch (err) {
    console.error('Ticket purchase initialization error:', err);
    res.status(500).json({ error: 'Failed to initiate purchase' });
  }
});

// Confirm ticket purchase after payment
router.post('/confirm-ticket', auth, isUser, async (req, res) => {
  const { ticketData } = req.body;

  try {
    const event = await Event.findById(ticketData.eventId);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    const ticketInfo = event.tickets.find(t => t.type === ticketData.ticketType);
    if (!ticketInfo) {
      return res.status(400).json({ error: 'Ticket type not found' });
    }

    const ticketsSold = await Ticket.countDocuments({
      eventId: ticketData.eventId,
      ticketType: ticketData.ticketType,
      status: 'purchased',
    });
    if (ticketsSold >= ticketInfo.quantity) {
      return res.status(400).json({ error: 'Tickets sold out' });
    }

    const qrCodeData = JSON.stringify({
      userId: ticketData.userId,
      eventId: ticketData.eventId,
      ticketType: ticketData.ticketType,
      purchaseDate: ticketData.purchaseDate,
    });
    const qrCode = await QRCode.toDataURL(qrCodeData);

    const ticket = new Ticket({
      userId: ticketData.userId,
      eventId: ticketData.eventId,
      ticketType: ticketData.ticketType,
      price: ticketData.price,
      qrCode,
      status: 'purchased',
      purchaseDate: new Date(ticketData.purchaseDate),
    });
    await ticket.save();

    res.json({ ticket });
  } catch (err) {
    console.error('Ticket confirmation error:', err);
    res.status(500).json({ error: 'Failed to confirm ticket' });
  }
});

// Verify a ticket (for organizers)
router.post('/verify', auth, isOrganizer, async (req, res) => {
  const { ticketData } = req.body;

  try {
    // Parse the QR code data (should be a JSON string)
    let parsedData;
    try {
      parsedData = JSON.parse(ticketData);
    } catch (err) {
      return res.status(400).json({ error: 'Invalid QR code data' });
    }

    const { userId, eventId, ticketType, purchaseDate } = parsedData;

    // Find the ticket
    const ticket = await Ticket.findOne({
      userId,
      eventId,
      ticketType,
      purchaseDate: new Date(purchaseDate),
    }).populate('eventId');

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    // Fetch the user to get their email
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Optionally: Check if the ticket has already been used
    // If you want to track usage, add a 'used' field to the Ticket model
    // if (ticket.used) {
    //   return res.status(400).json({ error: 'Ticket already used' });
    // }
    // ticket.used = true;
    // await ticket.save();

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
    console.error('Ticket verification error:', err);
    res.status(500).json({ error: 'Failed to verify ticket' });
  }
});

module.exports = router;