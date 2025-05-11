import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import PropTypes from 'prop-types';

export default function EventCard({ event }) {
  const navigate = useNavigate();
  const formattedDate = new Date(event.date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <motion.div
      whileHover={{ y: -10, boxShadow: '0 10px 20px rgba(0, 255, 204, 0.2)' }}
      className="bg-dark rounded-xl overflow-hidden cursor-pointer border border-neon/20"
      onClick={() => navigate(`/events/${event._id}`)}
    >
      <div className="relative">
        <img
          src={event.imageUrl || 'https://images.unsplash.com/photo-1531058020387-3be344556be6'}
          alt={event.title}
          className="w-full h-48 object-cover"
        />
        {event.isFeatured && (
          <span className="absolute top-2 right-2 bg-neon text-dark px-2 py-1 rounded-full text-sm font-bold">
            Featured
          </span>
        )}
      </div>
      <div className="p-4">
        <h3 className="text-xl font-semibold text-white mb-2">{event.title}</h3>
        <p className="text-gray-400 mb-1">📅 {formattedDate}</p>
        <p className="text-gray-400 mb-3">📍 {event.location}</p>
        <p className="text-neon font-bold">
          From ${Math.min(...event.tickets.map(t => t.price))}
        </p>
      </div>
    </motion.div>
  );
}

EventCard.propTypes = {
  event: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    date: PropTypes.string.isRequired,
    location: PropTypes.string.isRequired,
    imageUrl: PropTypes.string,
    isFeatured: PropTypes.bool,
    tickets: PropTypes.arrayOf(
      PropTypes.shape({
        type: PropTypes.string.isRequired,
        price: PropTypes.number.isRequired,
        quantity: PropTypes.number.isRequired,
      })
    ).isRequired,
  }).isRequired,
};