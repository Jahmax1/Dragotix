import { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkUser = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          API.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          const { data } = await API.get('/auth/me');
          console.log('User fetched on app load:', data);
          setUser(data);
        } catch (err) {
          console.error('Failed to fetch user:', err);
          localStorage.removeItem('token');
          delete API.defaults.headers.common['Authorization'];
          setUser(null);
        }
      } else {
        console.log('No token found on app load');
      }
      setLoading(false);
    };
    checkUser();
  }, []);

  const login = async (data) => {
    localStorage.setItem('token', data.token);
    API.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
    console.log('Setting user in AuthContext:', data.user);
    setUser(data.user);
    console.log('User state after login:', data.user);
  };

  const logout = () => {
    console.log('Logging out user');
    localStorage.removeItem('token');
    delete API.defaults.headers.common['Authorization'];
    setUser(null);
    navigate('/login', { replace: true });
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);