import styled from 'styled-components';
import { FiMoon, FiSun, FiBell } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useInvitations } from '../../contexts/InvitationsContext';

const NavbarContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 0;
  margin-bottom: 2rem;
`;

const Logo = styled.div`
  img {
    height: 30px;
    width: auto;
    transition: opacity 0.3s ease;
  }
`;

const NavbarActions = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;
`;

const ThemeToggle = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.text};
  font-size: 1.8rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  transition: transform 0.2s ease;

  &:hover {
    transform: scale(1.1);
  }
`;

const NotificationButton = styled.button`
  position: relative;
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.text};
  font-size: 1.8rem;
  cursor: pointer;
  transition: transform 0.2s ease;

  &:hover {
    transform: scale(1.1);
  }
`;

const NotificationBadge = styled.span`
  position: absolute;
  top: -0.5rem;
  right: -0.5rem;
  background-color: ${({ theme }) => theme.colors.danger};
  color: white;
  border-radius: 50%;
  width: 1.6rem;
  height: 1.6rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  font-weight: bold;
  animation: ${({ theme }) => theme.animations.pulse} 2s infinite;
`;

const UserAvatar = styled.div`
  width: 4rem;
  height: 4rem;
  border-radius: 50%;
  background-color: ${({ theme }) => theme.colors.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  cursor: pointer;
  overflow: hidden;
  transition: transform 0.2s ease;

  &:hover {
    transform: scale(1.05);
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

export default function Navbar({ user, toggleTheme, theme }) {
  const navigate = useNavigate();
  const { invitationsCount } = useInvitations();
  const imageSrc = `${process.env.REACT_APP_API_URL.replace('/api', '')}${
    user?.profileImage || '/uploads/default.jpg'
  }?t=${Date.now()}`;

  const handleNotificationClick = () => {
    navigate('/');
  };

  return (
    <NavbarContainer>
      <Logo>
        <img 
          src={theme === 'light' ? '/images/logo.png' : '/images/logo-dark.png'} 
          alt="Logo aplikacji" 
        />
      </Logo>
      
      <NavbarActions>
        <ThemeToggle 
          onClick={toggleTheme}
          aria-label={theme === 'light' ? 'Przełącz na tryb ciemny' : 'Przełącz na tryb jasny'}
        >
          {theme === 'light' ? <FiSun /> : <FiMoon />}
        </ThemeToggle>
        
        <NotificationButton 
          onClick={handleNotificationClick}
          aria-label="Powiadomienia"
        >
          <FiBell />
          {invitationsCount > 0 && (
            <NotificationBadge aria-label={`${invitationsCount} nieprzeczytanych zaproszeń`}>
              {invitationsCount > 9 ? '9+' : invitationsCount}
            </NotificationBadge>
          )}
        </NotificationButton>
        
        <UserAvatar 
          onClick={() => navigate('/profile')}
          aria-label="Profil użytkownika"
        >
          {user && (
            <img
              src={imageSrc}
              alt={`Profil ${user.firstName} ${user.lastName}`}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = `${process.env.REACT_APP_API_URL.replace('/api', '')}/uploads/default.jpg`;
              }}
            />
          )}
        </UserAvatar>
      </NavbarActions>
    </NavbarContainer>
  );
}