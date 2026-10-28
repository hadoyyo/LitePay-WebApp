import { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { useAuth } from '../../contexts/AuthContext';
import { useInvitations } from '../../contexts/InvitationsContext';

const LayoutContainer = styled.div`
  display: flex;
  min-height: 100vh;
  background-color: ${({ theme }) => theme.colors.background};
`;

const MainContent = styled.main`
  flex: 1;
  padding: 2rem;
  margin-left: ${({ $isSidebarOpen }) => ($isSidebarOpen ? '25rem' : '6rem')};
  transition: margin-left 0.3s ease;

  @media (max-width: 768px) {
    margin-left: 6rem;
    padding: 1rem;
  }
`;

export default function AppLayout({ toggleTheme, theme }) {
  const { user, isAuthenticated, logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { refreshInvitationsCount } = useInvitations();
  const sidebarRef = useRef(null);

  const toggleSidebar = () => {
    setIsSidebarOpen(prev => !prev);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setIsSidebarOpen(false);
      }
    };

    if (isSidebarOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isSidebarOpen]);

  return (
    <LayoutContainer>
      {isAuthenticated && (
        <div ref={sidebarRef}>
          <Sidebar 
            isOpen={isSidebarOpen} 
            toggleSidebar={toggleSidebar} 
            closeSidebar={closeSidebar}
            logout={logout}
          />
        </div>
      )}
      <MainContent $isSidebarOpen={isSidebarOpen}>
        {isAuthenticated && (
          <Navbar 
            user={user} 
            toggleTheme={toggleTheme} 
            theme={theme}
          />
        )}
        <Outlet context={{ refreshInvitationsCount }} />
      </MainContent>
    </LayoutContainer>
  );
}
