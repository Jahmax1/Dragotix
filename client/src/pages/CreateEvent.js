import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import API from '../api';

export default function CreateEvent() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    location: '',
    imageUrl: '',
    isFeatured: false,
    tickets: [{ type: '', price: '', quantity: '' }],
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleTicketChange = (index, field, value) => {
    const newTickets = [...formData.tickets];
    newTickets[index][field] = value;
    setFormData({ ...formData, tickets: newTickets });
  };

  const addTicketType = () => {
    setFormData({
      ...formData,
      tickets: [...formData.tickets, { type: '', price: '', quantity: '' }],
    });
  };

  const removeTicketType = (index) => {
    const newTickets = formData.tickets.filter((_, i) => i !== index);
    setFormData({ ...formData, tickets: newTickets });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // Basic validation
    if (!formData.title || !formData.date || !formData.location) {
      setError('Please fill in all required fields.');
      setLoading(false);
      return;
    }

    // Validate ticket types
    for (const ticket of formData.tickets) {
      if (!ticket.type || !ticket.price || !ticket.quantity) {
        setError('Please fill in all ticket details.');
        setLoading(false);
        return;
      }
      if (isNaN(ticket.price) || ticket.price <= 0) {
        setError('Ticket price must be a positive number.');
        setLoading(false);
        return;
      }
      if (isNaN(ticket.quantity) || ticket.quantity <= 0) {
        setError('Ticket quantity must be a positive number.');
        setLoading(false);
        return;
      }
    }

    try {
      await API.post('/events/create', formData);
      navigate('/admin-dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create event.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="min-h-screen bg-gradient-to-br from-dark to-primary py-16 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8 text-center">Create New Event</h1>
        <form onSubmit={handleSubmit} className="bg-dark p-6 rounded-xl shadow-lg border border-neon/20">
          {error && <div className="text-red-400 mb-4 text-center">{error}</div>}
          <div className="mb-6">
            <label className="block text-gray-300 mb-2" htmlFor="title">Event Title</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-gray-800 border border-neon/50 rounded-md text-white focus:outline-none focus:ring-neon focus:border-neon"
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-300 mb-2" htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-gray-800 border border-neon/50 rounded-md text-white focus:outline-none focus:ring-neon focus:border-neon"
              rows="4"
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-300 mb-2" htmlFor="date">Date</label>
            <input
              type="datetime-local"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-gray-800 border border-neon/50 rounded-md text-white focus:outline-none focus:ring-neon focus:border-neon"
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-300 mb-2" htmlFor="location">Location</label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-gray-800 border border-neon/50 rounded-md text-white focus:outline-none focus:ring-neon focus:border-neon"
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-300 mb-2" htmlFor="imageUrl">Image URL</label>
            <input
              type="text"
              id="imageUrl"
              name="imageUrl"
              value={formData.imageUrl}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-gray-800 border border-neon/50 rounded-md text-white focus:outline-none focus:ring-neon focus:border-neon"
            />
          </div>
          <div className="mb-6">
            <label className="flex items-center text-gray-300">
              <input
                type="checkbox"
                name="isFeatured"
                checked={formData.isFeatured}
                onChange={handleChange}
                className="mr-2"
              />
              Mark as Featured Event
            </label>
          </div>
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-white mb-4">Ticket Types</h2>
            {formData.tickets.map((ticket, index) => (
              <div key={index} className="bg-primary/20 p-4 rounded-lg mb-4">
                <div className="flex flex-col sm:flex-row sm:space-x-4">
                  <div className="flex-1 mb-4 sm:mb-0">
                    <label className="block text-gray-300 mb-2">Ticket Type</label>
                    <input
                      type="text"
                      value={ticket.type}
                      onChange={(e) => handleTicketChange(index, 'type', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-800 border border-neon/50 rounded-md text-white focus:outline-none focus:ring-neon focus:border-neon"
                      placeholder="e.g., General Admission"
                      required
                    />
                  </div>
                  <div className="flex-1 mb-4 sm:mb-0">
                    <label className="block text-gray-300 mb-2">Price ($)</label>
                    <input
                      type="number"
                      value={ticket.price}
                      onChange={(e) => handleTicketChange(index, 'price', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-800 border border-neon/50 rounded-md text-white focus:outline-none focus:ring-neon focus:border-neon"
                      required
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-gray-300 mb-2">Quantity</label>
                    <input
                      type="number"
                      value={ticket.quantity}
                      onChange={(e) => handleTicketChange(index, 'quantity', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-800 border border-neon/50 rounded-md text-white focus:outline-none focus:ring-neon focus:border-neon"
                      required
                    />
                  </div>
                </div>
                {formData.tickets.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeTicketType(index)}
                    className="mt-2 text-red-400 hover:text-red-300"
                  >
                    Remove Ticket Type
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addTicketType}
              className="bg-neon text-dark px-4 py-2 rounded-full hover:bg-neon/80"
            >
              Add Another Ticket Type
            </button>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            disabled={loading}
            className="w-full bg-accent text-white px-6 py-3 rounded-full hover:bg-accent/80 disabled:bg-gray-600"
          >
            {loading ? 'Creating...' : 'Create Event'}
          </motion.button>
        </form>
      </div>
    </motion.div>
  );
}