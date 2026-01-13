import { createContext, useContext, useState, useEffect, useRef } from 'react';
import api from '../api/axios';
import { io } from 'socket.io-client';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const socketRef = useRef(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { data } = await api.get('/auth/me');
      setUser(data.user);
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    setUser(data.user);
    return data;
  };

  const register = async (name, email, password) => {
    const { data } = await api.post('/auth/register', { name, email, password });
    setUser(data.user);
    return data;
  };

  const initSocket = () => {
    if (socketRef.current || !user) return;
    const base = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:8000';
    const socket = io(base, { withCredentials: true });
    socket.on('connect', () => console.log('socket connected', socket.id));
    socket.on('hired', (payload) => {
      alert(payload.message);
      console.log('hired payload', payload);
    });
    socketRef.current = socket;
  };

  useEffect(() => {
    if (user) initSocket();
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [user]);

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
};