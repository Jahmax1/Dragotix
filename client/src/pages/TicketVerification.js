import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import API from '../api';
import { QrReader } from 'react-qr-reader';

export default function TicketVerification() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [scanResult, setScanResult] = useState(null);
  const [scanError, setScanError] = useState(null);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const { data } = await API.get(`/events/${eventId}`);
        setEvent(data);
      } catch (err) {
        setError('Failed to load event details.');
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [eventId]);

  const handleScan = async (data) => {
    if (data) {
      try {
        setScanError(null);
        const ticketData = data.text; // QR code data is passed as text
        const { data: result } = await API.post('/tickets/verify', { ticketData });
        setScanResult(result);
      } catch (err) {
        setScanError(err.response?.data?.error || 'Failed to verify ticket.');
      }
    }
  };

  const handleError = (err) => {
    setScanError('Error accessing camera. Please ensure permissions are granted.');
    console.error('QR scan error:', err);
  };

  if (loading) return <div className="text-center text-gray-400 py-20">Loading...</div>;
  if (error) return <div className="text-center text-red-400 py-20">{error}</div>;
  if (!event) return <div className="text-center text-gray-400 py-20">Event not found</div>;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="min-h-screen bg-dark py-16 px-4"
    >
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8 text-center">
          Verify Tickets for {event.title}
        </h1>
        <button
          onClick={() => navigate('/admin-dashboard')}
          className="mb-6 bg-neon text-dark px-4 py-2 rounded-full hover:bg-neon/80 transition"
        >
          Back to Dashboard
        </button>
        <div className="bg-dark rounded-xl p-6 border border-neon/20">
          <h2 className="text-2xl font-semibold text-white mb-4">Scan QR Code</h2>
          <div className="mb-6">
            <QrReader
              delay={300}
              onError={handleError}
              onResult={handleScan}
              style={{ width: '100%', maxWidth: '400px', margin: '0 auto' }}
              constraints={{ facingMode: 'environment' }}
            />
          </div>
          {scanError && <div className="text-red-400 text-center mb-4">{scanError}</div>}
          {scanResult && (
            <div className="bg-primary/20 p-4 rounded-lg text-center">
              <h3 className="text-xl font-semibold text-white mb-2">Ticket Verified</h3>
              <p className="text-gray-300"><strong>User Email:</strong> {scanResult.ticket.userEmail}</p>
              <p className="text-gray-300"><strong>Event:</strong> {scanResult.ticket.eventTitle}</p>
              <p className="text-gray-300"><strong>Ticket Type:</strong> {scanResult.ticket.ticketType}</p>
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
      </div>
    </motion.div>
  );
}