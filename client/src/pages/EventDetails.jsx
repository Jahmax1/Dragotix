import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import API from '../api';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe('pk_test_51R32A3PM6jy4uZHt1GwVBwHJXlahcxqeWJt13lvjpPipySNaF8lwYDt2BkVvBatfGIJHxQaILgPP5lsWhCXkqIiN00gn4ucHyR');

function CheckoutForm({ eventId, ticketType, price, setPurchasedTicket }) {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [clientSecret, setClientSecret] = useState('');
  const [ticketData, setTicketData] = useState(null);

  useEffect(() => {
    const initiatePayment = async () => {
      try {
        const { data } = await API.post('/tickets/buy', { eventId, ticketType });
        setClientSecret(data.clientSecret);
        setTicketData(data.ticketData);
      } catch (err) {
        setError('Failed to initiate payment.');
      }
    };
    initiatePayment();
  }, [eventId, ticketType]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!stripe || !elements || !clientSecret || !ticketData) {
      setError('Payment setup incomplete.');
      setLoading(false);
      return;
    }

    try {
      const cardElement = elements.getElement(CardElement);
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: { card: cardElement },
      });

      if (stripeError) {
        setError(stripeError.message);
        setLoading(false);
        return;
      }

      if (paymentIntent.status === 'succeeded') {
        const { data } = await API.post('/tickets/confirm-ticket', { ticketData });
        setPurchasedTicket(data.ticket);
      } else {
        setError('Payment failed. Please try again.');
      }
    } catch (err) {
      setError('An error occurred during payment. Please try again.');
      console.error('Payment error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <CardElement className="p-3 bg-gray-800 text-white rounded-lg mb-4" />
      {error && <div className="text-red-400 mb-4">{error}</div>}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        type="submit"
        disabled={!stripe || loading}
        className="bg-accent text-white px-6 py-3 rounded-full hover:bg-accent/80 disabled:bg-gray-600"
      >
        {loading ? 'Processing...' : `Pay $${price}`}
      </motion.button>
    </form>
  );
}

export default function EventDetails() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [purchasingTicket, setPurchasingTicket] = useState(null);
  const [purchasedTicket, setPurchasedTicket] = useState(null);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const { data } = await API.get(`/events/${id}`);
        setEvent(data);
      } catch (err) {
        setError('Failed to load event.');
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id]);

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
      <div className="max-w-4xl mx-auto bg-dark rounded-xl shadow-lg border border-neon/20 overflow-hidden">
        <img
          src={event.imageUrl || '/placeholder-event.jpg'}
          alt={event.title}
          className="w-full h-64 md:h-96 object-cover"
        />
        <div className="p-6">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">{event.title}</h1>
          <p className="text-gray-300 mb-2">
            <strong>Date:</strong> {new Date(event.date).toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
          <p className="text-gray-300 mb-4">
            <strong>Location:</strong> {event.location}
          </p>
          <p className="text-gray-400 mb-6">{event.description || 'No description available.'}</p>
          <h2 className="text-2xl font-semibold text-white mb-4">Tickets</h2>
          {purchasedTicket ? (
            <div className="bg-primary/20 p-6 rounded-lg text-center">
              <h3 className="text-xl font-semibold text-white mb-4">Ticket Purchased!</h3>
              <p className="text-gray-300 mb-4">
                You can view your ticket and QR code in your dashboard.
              </p>
              <a
                href="/dashboard"
                className="inline-block bg-neon text-dark px-6 py-2 rounded-full hover:bg-neon/80 transition"
              >
                Go to Dashboard
              </a>
            </div>
          ) : (
            <div className="space-y-4">
              {event.tickets.map(ticket => (
                <div
                  key={ticket.type}
                  className="flex justify-between items-center bg-primary/20 p-4 rounded-lg"
                >
                  <span className="text-white font-semibold">{ticket.type.toUpperCase()}</span>
                  <div className="text-right">
                    <p className="text-neon font-bold">${ticket.price}</p>
                    <p className="text-gray-400 text-sm">{ticket.quantity} available</p>
                    {purchasingTicket === ticket.type ? (
                      <Elements stripe={stripePromise}>
                        <CheckoutForm
                          eventId={event._id}
                          ticketType={ticket.type}
                          price={ticket.price}
                          setPurchasedTicket={setPurchasedTicket}
                        />
                      </Elements>
                    ) : (
                      <button
                        onClick={() => setPurchasingTicket(ticket.type)}
                        className="mt-2 bg-accent text-white px-4 py-2 rounded-full text-sm hover:bg-accent/80"
                      >
                        Buy Now
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}