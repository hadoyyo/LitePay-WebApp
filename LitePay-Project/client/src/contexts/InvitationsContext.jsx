// client/src/contexts/InvitationsContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const InvitationsContext = createContext();

export function InvitationsProvider({ children }) {
  const [invitationsCount, setInvitationsCount] = useState(0);
  
  const fetchInvitationsCount = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/invitations/count`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setInvitationsCount(response.data.data.count);
    } catch (error) {
      console.error('Error fetching invitations count:', error);
      setInvitationsCount(0);
    }
  };

  // Dodajemy funkcję do ręcznego odświeżania
  const refreshInvitationsCount = async () => {
    await fetchInvitationsCount();
  };

  useEffect(() => {
    fetchInvitationsCount();
  }, []);

  return (
    <InvitationsContext.Provider value={{ invitationsCount, refreshInvitationsCount }}>
      {children}
    </InvitationsContext.Provider>
  );
}

export function useInvitations() {
  return useContext(InvitationsContext);
}