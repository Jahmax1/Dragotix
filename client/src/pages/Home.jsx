import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function Home() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="min-h-screen bg-gradient-to-br from-dark to-primary flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8"
    >
      <div className="text-center">
        <h1 className="text-5xl font-extrabold text-white mb-6">Welcome to DragonTix</h1>
        <p className="text-xl text-gray-300 mb-8">Discover and create amazing events with ease.</p>
        <Link
          to="/events"
          className="inline-block bg-neon text-dark px-8 py-3 rounded-full text-lg font-semibold hover:bg-neon/80 transition"
        >
          Explore Events
        </Link>
      </div>
    </motion.div>
  );
}