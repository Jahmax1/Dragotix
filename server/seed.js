require('dotenv').config();
const mongoose = require('mongoose');
const Event = require('./models/Event');
const User = require('./models/User'); // Make sure you have a User model

console.log('Starting seed process...');

const seedEvents = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/dragontix');
    console.log('Connected to MongoDB');

    // Create a test organizer if doesn't exist
    let organizer = await User.findOne({ email: 'organizer@dragontix.com' });
    if (!organizer) {
      organizer = await User.create({
        email: 'organizer@dragontix.com',
        password: 'tempPassword123',
        role: 'organizer'
      });
      console.log('Created organizer user');
    }

    // Clear existing data
    const deleteResult = await Event.deleteMany();
    console.log(`Deleted ${deleteResult.deletedCount} events`);

    // Sample events data with organizer reference
    const events = [
      {
        title: "Summer Music Festival",
        description: "The biggest music event of the year",
        date: new Date('2024-07-15'),
        location: "Central Park, New York",
        organizer: organizer._id,
        isFeatured: true,
        tickets: [
          { type: 'regular', price: 99, quantity: 1000 },
          { type: 'vip', price: 299, quantity: 100 }
        ],
        imageUrl: "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4"
      },
      {
        title: "Tech Conference 2024",
        description: "Annual technology summit",
        date: new Date('2024-09-20'),
        location: "Moscone Center, San Francisco",
        organizer: organizer._id,
        isFeatured: true,
        tickets: [
          { type: 'regular', price: 399, quantity: 500 }
        ],
        imageUrl: "https://images.unsplash.com/photo-1431540015161-0bf868a2d407"
      }
    ];

    // Insert new data
    const insertResult = await Event.insertMany(events);
    console.log(`Inserted ${insertResult.length} events`);

  } catch (err) {
    console.error('Seeding error:', err);
  } finally {
    // Close connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
    process.exit(0);
  }
};

seedEvents();