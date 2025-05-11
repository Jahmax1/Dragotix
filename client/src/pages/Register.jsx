import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import API from '../api';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [shouldRedirect, setShouldRedirect] = useState(null);

  useEffect(() => {
    if (shouldRedirect && user) {
      console.log('User state confirmed in Register.jsx, redirecting to:', shouldRedirect);
      navigate(shouldRedirect, { replace: true });
    } else if (shouldRedirect && !user) {
      console.log('User state not yet set in Register.jsx, waiting...');
    }
  }, [user, shouldRedirect, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      console.log('Sending register request:', { email, password, role });
      const { data } = await API.post('/auth/register', { email, password, role });
      console.log('Received register response:', data);

      console.log('Calling login function with:', data);
      await login(data);

      const redirectPath = data.user.role === 'organizer' ? '/admin-dashboard' : '/dashboard';
      console.log('Setting redirect path:', redirectPath);
      setShouldRedirect(redirectPath);
    } catch (err) {
      console.error('Registration failed with error:', err.message);
      setError(err.response?.data?.error || 'Failed to register. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="min-h-screen bg-gradient-to-br from-dark to-primary flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-md w-full space-y-8 bg-dark p-8 rounded-xl shadow-lg border border-neon/20">
        <div>
          <h2 className="text-center text-3xl font-extrabold text-white">Register for DragonTix</h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && <div className="text-red-400 text-center">{error}</div>}
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email-address" className="sr-only">Email address</label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 bg-gray-800 border border-neon/50 placeholder-gray-500 text-white rounded-t-md focus:outline-none focus:ring-neon focus:border-neon focus:z-10 sm:text-sm"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 bg-gray-800 border border-neon/50 placeholder-gray-500 text-white rounded-b-md focus:outline-none focus:ring-neon focus:border-neon focus:z-10 sm:text-sm"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="mb-6">
            <p className="text-white mb-2">Register as</p>
            <label className="flex items-center text-gray-300 mb-2">
              <input
                type="radio"
                value="user"
                checked={role === 'user'}
                onChange={(e) => setRole(e.target.value)}
                className="mr-2"
              />
              User (Buy tickets)
            </label>
            <label className="flex items-center text-gray-300">
              <input
                type="radio"
                value="organizer"
                checked={role === 'organizer'}
                onChange={(e) => setRole(e.target.value)}
                className="mr-2"
              />
              Organizer (Manage events)
            </label>
          </div>

          <div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-dark bg-neon hover:bg-neon/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-neon disabled:bg-gray-600"
            >
              {loading ? 'Registering...' : 'Register'}
            </motion.button>
          </div>
        </form>
        <p className="text-gray-400 mt-4 text-center">
          Already have an account?{' '}
          <Link to="/login" className="text-neon hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </motion.div>
  );
}