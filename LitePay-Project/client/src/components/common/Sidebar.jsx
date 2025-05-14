import { FiLogOut } from 'react-icons/fi';
import styled from 'styled-components';
import { NavLink } from 'react-router-dom';
import { 
  FiHome, 
  FiUser, 
  FiUsers, 
  FiDollarSign, 
  FiHelpCircle, 
  FiMenu,
  FiChevronLeft
} from 'react-icons/fi';

const SidebarContainer = styled.aside`
  width: ${({ $isOpen }) => ($isOpen ? '25rem' : '6rem')};
  height: 100vh;
  position: fixed;
  background-color: ${({ theme }) => theme.colors.cardBackground};
  box-shadow: ${({ theme }) => theme.shadows.md};
  transition: width 0.3s ease;
  z-index: 10;
  border-top-right-radius: 28px;
  border-bottom-right-radius: 28px;
`;

const SidebarHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 2rem;
  height: 6rem;
  position: relative;
  margin-top: 1rem;
  z-index: 20;
`;

const Logo = styled.h1`
  font-size: 1.8rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.primary};
  white-space: nowrap;
  opacity: ${({ $isOpen }) => ($isOpen ? 1 : 0)};
  transition: opacity 0.3s ease;
  /* Dodano aby tekst nie wychodził poza kontener */
  overflow: hidden;
`;

const ToggleButton = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.text};
  font-size: 2rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  /* Dodano aby przycisk był zawsze klikalny */
  position: relative;
  z-index: 20;
`;

const Nav = styled.nav`
  padding: 2rem 0;
  /* Dodano aby zawartość nie była przycinana */
  overflow: visible;
`;

const NavItem = styled(NavLink)`
  display: flex;
  align-items: center;
  padding: 1.2rem 2rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  text-decoration: none;
  transition: all 0.3s ease;
  white-space: nowrap;
  /* Dodano aby elementy nawigacji nie wychodziły poza kontener */
  overflow: hidden;

  &:hover {
    background-color: ${({ theme }) => theme.colors.background};
    color: ${({ theme }) => theme.colors.primary};
  }

  &.active {
    background-color: ${({ theme }) => theme.colors.background};
    color: ${({ theme }) => theme.colors.primary};
    border-right: 3px solid ${({ theme }) => theme.colors.primary};
  }
`;

const IconWrapper = styled.span`
  font-size: 2rem;
  margin-right: ${({ $isOpen }) => ($isOpen ? '1.5rem' : '0')};
  min-width: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const NavText = styled.span`
  opacity: ${({ $isOpen }) => ($isOpen ? 1 : 0)};
  transition: opacity 0.3s ease;
  /* Dodano aby tekst nie wychodził poza kontener */
  overflow: hidden;
`;

const LogoutButton = styled(NavLink)`
  display: flex;
  align-items: center;
  padding: 1.2rem 2rem;
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.textSecondary};
  cursor: pointer;
  width: 100%;
  white-space: nowrap;
  transition: all 0.3s ease;
  /* Dodano aby przycisk nie wychodził poza kontener */
  overflow: hidden;

  &:hover {
    background-color: ${({ theme }) => theme.colors.background};
    color: ${({ theme }) => theme.colors.danger};
  }
`;

export default function Sidebar({ isOpen, toggleSidebar, logout }) {
  return (
    <SidebarContainer $isOpen={isOpen}>
      <SidebarHeader>
        <Logo $isOpen={isOpen}>Menu</Logo>
        <ToggleButton onClick={toggleSidebar}>
          {isOpen ? <FiChevronLeft /> : <FiMenu />}
        </ToggleButton>
      </SidebarHeader>
      <Nav>
        <NavItem to="/">
          <IconWrapper $isOpen={isOpen}>
            <FiHome />
          </IconWrapper>
          <NavText $isOpen={isOpen}>Strona główna</NavText>
        </NavItem>
        <NavItem to="/profile">
          <IconWrapper $isOpen={isOpen}>
            <FiUser />
          </IconWrapper>
          <NavText $isOpen={isOpen}>Moje dane</NavText>
        </NavItem>
        <NavItem to="/groups">
          <IconWrapper $isOpen={isOpen}>
            <FiUsers />
          </IconWrapper>
          <NavText $isOpen={isOpen}>Grupy</NavText>
        </NavItem>
        <NavItem to="/finances">
          <IconWrapper $isOpen={isOpen}>
            <FiDollarSign />
          </IconWrapper>
          <NavText $isOpen={isOpen}>Finanse</NavText>
        </NavItem>
        <NavItem to="/help">
          <IconWrapper $isOpen={isOpen}>
            <FiHelpCircle />
          </IconWrapper>
          <NavText $isOpen={isOpen}>Pomoc</NavText>
        </NavItem>
      </Nav>
      <LogoutButton onClick={logout}>
        <IconWrapper $isOpen={isOpen}>
          <FiLogOut />
        </IconWrapper>
        <NavText $isOpen={isOpen}>Wyloguj się</NavText>
      </LogoutButton>
    </SidebarContainer>
  );
}