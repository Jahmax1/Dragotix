const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const auth = require('../middleware/auth');

// Middleware to ensure only organizers can create events
const isOrganizer = async (req, res, next) => {
  if (req.user.role !== 'organizer') {
    return res.status(403).json({ error: 'Access denied: Organizers only' });
  }
  next();
};

// Get all events
router.get('/', auth, async (req, res) => {
  try {
    const events = await Event.find();
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

// Get event by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ error: 'Event not found' });
    res.json(event);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch event' });
  }
});

// Create a new event
router.post('/create', auth, isOrganizer, async (req, res) => {
  const { title, description, date, location, imageUrl, isFeatured, tickets } = req.body;
  try {
    // Basic validation
    if (!title || !date || !location) {
      return res.status(400).json({ error: 'Title, date, and location are required' });
    }
    if (!tickets || !Array.isArray(tickets) || tickets.length === 0) {
      return res.status(400).json({ error: 'At least one ticket type is required' });
    }
    for (const ticket of tickets) {
      if (!ticket.type || !ticket.price || !ticket.quantity) {
        return res.status(400).json({ error: 'Each ticket must have a type, price, and quantity' });
      }
      if (isNaN(ticket.price) || ticket.price <= 0) {
        return res.status(400).json({ error: 'Ticket price must be a positive number' });
      }
      if (isNaN(ticket.quantity) || ticket.quantity <= 0) {
        return res.status(400).json({ error: 'Ticket quantity must be a positive number' });
      }
    }

    const event = new Event({
      title,
      description,
      date,
      location,
      imageUrl,
      isFeatured: isFeatured || false,
      tickets: tickets.map(ticket => ({
        type: ticket.type,
        price: Number(ticket.price),
        quantity: Number(ticket.quantity),
      })),
      organizer: req.user.id,
    });
    await event.save();
    res.status(201).json(event);
  } catch (err) {
    console.error('Event creation error:', err);
    res.status(500).json({ error: 'Failed to create event' });
  }
});

module.exports = router;