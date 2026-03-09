import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (stored && token) {
      setUser(JSON.parse(stored));
    }
    setLoading(false);
  }, []);

  const adminLogin = async (email, password) => {
    console.log('🔐 Admin login attempt:', email);
    const { data } = await api.post('/auth/admin/login', { email, password });
    console.log('✅ Login response:', data);
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data));
    console.log('✅ User stored in localStorage');
    setUser(data);
    console.log('✅ User state updated:', data);
    return data;
  };

  const studentLogin = async (studentId, password) => {
    console.log('🔐 Student login attempt:', studentId);
    try {
      const { data } = await api.post('/auth/student/login', { studentId, password });
      console.log('✅ Login response received:', data);
      console.log('   Response role:', data.role);
      console.log('   Response studentId:', data.studentId);
      
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data));
      console.log('✅ User and token stored in localStorage');
      
      setUser(data);
      console.log('✅ User state updated in context');
      console.log('   User object:', { role: data.role, name: data.name, studentId: data.studentId });
      return data;
    } catch (error) {
      console.error('❌ Student login error:', error.response?.data || error.message);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, adminLogin, studentLogin, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
