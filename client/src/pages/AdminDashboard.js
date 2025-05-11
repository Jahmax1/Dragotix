import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Html5Qrcode } from 'html5-qrcode';
import API from '../api';
import { useAuth } from '../context/AuthContext';

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [scannerActive, setScannerActive] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const html5QrCodeRef = useRef(null); // To manage the Html5Qrcode instance

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const { data } = await API.get('/events');
        const organizerEvents = data.filter(event => event.organizer === user.id);
        setEvents(organizerEvents);
      } catch (err) {
        setError('Failed to load events. Please try again later.');
        console.error('Error fetching events:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, [user]);

  useEffect(() => {
    if (selectedEvent) {
      const fetchTickets = async () => {
        try {
          const { data } = await API.get(`/tickets/event/${selectedEvent._id}`);
          setTickets(data);
        } catch (err) {
          setError('Failed to load tickets for this event.');
          console.error('Error fetching tickets:', err);
        }
      };
      fetchTickets();
    }
  }, [selectedEvent]);

  const startScanner = async () => {
    setScannerActive(true);
    setScanResult(null);
    setError('');

    try {
      // Initialize the scanner
      const html5QrCode = new Html5Qrcode('reader');
      html5QrCodeRef.current = html5QrCode;

      await html5QrCode.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        async (decodedText) => {
          try {
            const ticketData = decodedText;
            const { data } = await API.post('/tickets/verify', { ticketData });
            setScanResult(data);
            await html5QrCode.stop();
            setScannerActive(false);
            html5QrCodeRef.current = null;
          } catch (err) {
            setError(err.response?.data?.error || 'Failed to verify ticket.');
            await html5QrCode.stop();
            setScannerActive(false);
            html5QrCodeRef.current = null;
          }
        },
        (err) => {
          console.error('QR Code scan error:', err);
        }
      );
    } catch (err) {
      setError('Failed to start scanner. Please ensure camera permissions are granted.');
      console.error('Scanner startup error:', err);
      setScannerActive(false);
    }
  };

  const stopScanner = async () => {
    if (html5QrCodeRef.current) {
      try {
        await html5QrCodeRef.current.stop();
        html5QrCodeRef.current = null;
        setScannerActive(false);
      } catch (err) {
        console.error('Error stopping scanner:', err);
      }
    }
  };

  // Cleanup scanner on component unmount
  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, []);

  const getTicketsSold = (ticketType) => {
    return tickets.filter(ticket => ticket.ticketType === ticketType && ticket.status === 'purchased').length;
  };

  if (loading) return <div className="text-center text-gray-400 py-20">Loading...</div>;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gradient-to-br from-dark to-primary py-16 px-4"
    >
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-12">
          <h1 className="text-4xl font-bold text-white">Organizer Dashboard</h1>
          <div className="space-x-4">
            <Link
              to="/events"
              className="bg-neon text-dark px-4 py-2 rounded-full hover:bg-neon/80 transition"
            >
              Browse Events
            </Link>
            <Link
              to="/create-event"
              className="bg-neon text-dark px-4 py-2 rounded-full hover:bg-neon/80 transition"
            >
              Create Event
            </Link>
            <button
              onClick={logout}
              className="bg-neon text-dark px-4 py-2 rounded-full hover:bg-neon/80 transition"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Event Selection */}
        <div className="bg-dark rounded-xl p-6 border border-neon/20 mb-8">
          <h2 className="text-2xl font-semibold text-white mb-4">Select an Event</h2>
          {events.length === 0 ? (
            <p className="text-gray-400">No events created yet.</p>
          ) : (
            <select
              onChange={(e) => {
                const event = events.find(ev => ev._id === e.target.value);
                setSelectedEvent(event);
                setTickets([]);
                setScanResult(null);
                setError('');
                stopScanner(); // Stop scanner when changing events
              }}
              className="w-full px-3 py-2 bg-gray-800 border border-neon/50 rounded-md text-white focus:outline-none focus:ring-neon focus:border-neon"
            >
              <option value="">Select an event</option>
              {events.map(event => (
                <option key={event._id} value={event._id}>
                  {event.title}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Ticket Stats */}
        {selectedEvent && (
          <div className="bg-dark rounded-xl p-6 border border-neon/20 mb-8">
            <h2 className="text-2xl font-semibold text-white mb-4">
              Ticket Statistics for {selectedEvent.title}
            </h2>
            {selectedEvent.tickets.map(ticket => (
              <div key={ticket.type} className="bg-primary/20 p-4 rounded-lg mb-4">
                <p className="text-white font-semibold">{ticket.type.toUpperCase()}</p>
                <p className="text-gray-300">Price: ${ticket.price}</p>
                <p className="text-gray-300">Total Available: {ticket.quantity}</p>
                <p className="text-gray-300">Tickets Sold: {getTicketsSold(ticket.type)}</p>
                <p className="text-gray-300">
                  Tickets Remaining: {ticket.quantity - getTicketsSold(ticket.type)}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Ticket Scanning */}
        {selectedEvent && (
          <div className="bg-dark rounded-xl p-6 border border-neon/20">
            <h2 className="text-2xl font-semibold text-white mb-4">
              Scan Tickets for {selectedEvent.title}
            </h2>
            <div id="reader" className="mb-4 w-full max-w-md mx-auto"></div>
            <div className="text-center space-x-4">
              <button
                onClick={startScanner}
                disabled={scannerActive}
                className="bg-accent text-white px-6 py-2 rounded-full hover:bg-accent/80 disabled:bg-gray-600"
              >
                {scannerActive ? 'Scanning...' : 'Start Scanner'}
              </button>
              {scannerActive && (
                <button
                  onClick={stopScanner}
                  className="bg-red-500 text-white px-6 py-2 rounded-full hover:bg-red-600"
                >
                  Stop Scanner
                </button>
              )}
            </div>
            {error && <div className="text-red-400 mt-4 text-center">{error}</div>}
            {scanResult && (
              <div className="bg-primary/20 p-6 rounded-lg mt-6">
                <h3 className="text-xl font-semibold text-white mb-4">Scan Result</h3>
                <p className="text-gray-300">
                  <strong>Status:</strong> {scanResult.message}
                </p>
                <p className="text-gray-300">
                  <strong>User Email:</strong> {scanResult.ticket.userEmail}
                </p>
                <p className="text-gray-300">
                  <strong>Event:</strong> {scanResult.ticket.eventTitle}
                </p>
                <p className="text-gray-300">
                  <strong>Ticket Type:</strong> {scanResult.ticket.ticketType}
                </p>
                <p className="text-gray-300">
                  <strong>Purchased On:</strong>{' '}
                  {new Date(scanResult.ticket.purchaseDate).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}