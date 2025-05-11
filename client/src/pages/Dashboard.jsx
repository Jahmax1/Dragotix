import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { QRCodeCanvas } from 'qrcode.react';
import API from '../api';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const { data } = await API.get('/tickets/my-tickets');
        setTickets(data);
      } catch (err) {
        setError('Failed to load tickets. Please try again later.');
        console.error('Error fetching tickets:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTickets();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gradient-to-br from-dark to-primary py-16 px-4"
    >
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-12">
          <h1 className="text-4xl font-bold text-white">Your Dashboard</h1>
          <div className="space-x-4">
            <Link
              to="/events"
              className="bg-neon text-dark px-4 py-2 rounded-full hover:bg-neon/80 transition"
            >
              Browse Events
            </Link>
            <button
              onClick={logout}
              className="bg-neon text-dark px-4 py-2 rounded-full hover:bg-neon/80 transition"
            >
              Logout
            </button>
          </div>
        </div>
        <div className="bg-dark rounded-xl p-6 border border-neon/20 mb-8">
          <h2 className="text-2xl font-semibold text-white mb-4">
            Welcome, {user?.email || 'User'}
          </h2>
          <p className="text-gray-400">Manage your tickets with ease.</p>
        </div>
        <div className="bg-dark rounded-xl p-6 border border-neon/20 mb-8">
          <h2 className="text-2xl font-semibold text-white mb-4">My Tickets</h2>
          {loading ? (
            <p className="text-gray-400 text-center">Loading...</p>
          ) : error ? (
            <p className="text-red-400 text-center">{error}</p>
          ) : tickets.length > 0 ? (
            <ul className="space-y-4">
              {tickets.map(ticket => (
                <li key={ticket._id} className="bg-primary/20 p-4 rounded-lg">
                  <div className="flex flex-col md:flex-row md:justify-between md:items-center">
                    <div className="mb-4 md:mb-0">
                      <h3 className="text-xl font-semibold text-white">
                        {ticket.eventId?.title || 'Unknown Event'}
                      </h3>
                      <p className="text-gray-300">
                        <strong>Date:</strong>{' '}
                        {ticket.eventId?.date
                          ? new Date(ticket.eventId.date).toLocaleDateString('en-US', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })
                          : 'Date unavailable'}
                      </p>
                      <p className="text-gray-300">
                        <strong>Ticket Type:</strong> {ticket.ticketType || 'Unknown'}
                      </p>
                      <p className="text-gray-300">
                        <strong>Purchased On:</strong>{' '}
                        {ticket.purchaseDate
                          ? new Date(ticket.purchaseDate).toLocaleDateString('en-US', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })
                          : 'Date unavailable'}
                      </p>
                    </div>
                    <div className="flex flex-col items-center">
                      <p className="text-gray-300 mb-2">Show this QR code at the entrance:</p>
                      <QRCodeCanvas
                        value={JSON.stringify({
                          userId: ticket.userId || '',
                          eventId: ticket.eventId?._id || '',
                          ticketType: ticket.ticketType || '',
                          purchaseDate: ticket.purchaseDate || '',
                        })}
                        size={150}
                        bgColor="#1a1a2e"
                        fgColor="#00ffcc"
                      />
                    </div>
                  </div>
                  <div className="mt-4 text-center">
                    <Link
                      to={`/events/${ticket.eventId?._id || ''}`}
                      className="inline-block bg-accent text-white px-4 py-2 rounded-full hover:bg-accent/80"
                    >
                      View Event
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-400 text-center">No tickets yet. Browse events to buy one!</p>
          )}
        </div>
      </div>
    </motion.div>
  );
}