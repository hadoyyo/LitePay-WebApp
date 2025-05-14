import { createContext, useState, useEffect, useCallback, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const checkAuth = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      const res = await axios.get(`${process.env.REACT_APP_API_URL}/users/me`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setUser(res.data.data);
      setIsAuthenticated(true);
    } catch (err) {
      localStorage.removeItem('token');
      setError(err.response?.data?.error || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (username, password) => {
    try {
      setLoading(true);
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/auth/login`, {
        username,
        password
      });

      localStorage.setItem('token', res.data.token);
      await checkAuth();
      setError(null);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/auth/register`, userData);

      localStorage.setItem('token', res.data.token);
      await checkAuth();
      setError(null);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setIsAuthenticated(false);
    navigate('/login');
  };

  const updateUser = async (userData) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.put(`${process.env.REACT_APP_API_URL}/users/me`, userData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
  
      setUser(prev => ({
        ...prev,
        firstName: res.data.data.firstName,
        lastName: res.data.data.lastName,
        email: res.data.data.email
      }));
      
      return res.data.data;
    } catch (err) {
      setError(err.response?.data?.error || 'Update failed');
      throw err;
    }
  };

  const updatePassword = async (currentPassword, newPassword) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.put(
        `${process.env.REACT_APP_API_URL}/users/me/password`,
        { currentPassword, newPassword },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      return res.data;
    } catch (err) {
      throw err;
    }
  };

  const updatePhoto = async (photoFile) => {
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('file', photoFile);

      const res = await axios.put(`${process.env.REACT_APP_API_URL}/users/me/photo`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      setUser(prev => ({ ...prev, profileImage: res.data.data }));
      return res.data.data;
    } catch (err) {
      setError(err.response?.data?.error || 'Photo update failed');
      throw err;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        loading,
        error,
        login,
        register,
        logout,
        updateUser,
        updatePhoto,
        updatePassword,
        checkAuth
      }}
    >
      {loading ? <div></div> : children}
    </AuthContext.Provider>
  );
}