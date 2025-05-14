import { useState } from 'react';
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { refreshInvitationsCount } = useInvitations();

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <LayoutContainer>
      {isAuthenticated && (
        <Sidebar 
          isOpen={isSidebarOpen} 
          toggleSidebar={toggleSidebar} 
          logout={logout}
        />
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