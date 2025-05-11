import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import API from '../api';

export default function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const { data } = await API.get('/events');
        setEvents(data);
      } catch (err) {
        setError('Failed to load events. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  if (loading) return <div className="text-center text-gray-400 py-20">Loading...</div>;
  if (error) return <div className="text-center text-red-400 py-20">{error}</div>;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gradient-to-br from-dark to-primary py-16 px-4"
    >
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-12 text-center">Explore Events</h1>
        {events.length === 0 ? (
          <p className="text-gray-400 text-center">No events available at the moment.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {events.map(event => (
              <motion.div
                key={event._id}
                whileHover={{ scale: 1.05 }}
                className="bg-dark rounded-xl shadow-lg border border-neon/20 overflow-hidden"
              >
                <img
                  src={event.imageUrl || '/placeholder-event.jpg'}
                  alt={event.title}
                  className="w-full h-48 object-cover"
                />
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-white mb-2">{event.title}</h2>
                  <p className="text-gray-300 mb-2">
                    {new Date(event.date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                  <p className="text-gray-400 mb-4">{event.location}</p>
                  <Link
                    to={`/events/${event._id}`}
                    className="inline-block bg-neon text-dark px-6 py-2 rounded-full hover:bg-neon/80 transition"
                  >
                    View Details
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}