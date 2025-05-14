import axios from 'axios';

export const login = async (username, password) => {
  const response = await axios.post(`${process.env.REACT_APP_API_URL}/auth/login`, {
    username,
    password
  });
  return response.data;
};

export const register = async (userData) => {
  const response = await axios.post(`${process.env.REACT_APP_API_URL}/auth/register`, userData);
  return response.data;
};

export const getMe = async (token) => {
  const response = await axios.get(`${process.env.REACT_APP_API_URL}/users/me`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return response.data;
};

export const updateUser = async (token, userData) => {
  const response = await axios.put(`${process.env.REACT_APP_API_URL}/users/me`, userData, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return response.data;
};

export const updatePhoto = async (token, photoFile) => {
  const formData = new FormData();
  formData.append('file', photoFile);

  const response = await axios.put(`${process.env.REACT_APP_API_URL}/users/me/photo`, formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
};