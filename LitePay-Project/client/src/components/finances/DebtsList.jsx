import styled from 'styled-components';
import { FiUser, FiArrowUp, FiArrowDown } from 'react-icons/fi';

const DebtsContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;

  @media (min-width: 768px) {
    grid-template-columns: 1fr 1fr;
  }
`;

const DebtSection = styled.div``;

const SectionTitle = styled.h3`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0;
  color: ${({ theme }) => theme.colors.text};
`;

const DebtItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  margin-bottom: 0.5rem;
  background-color: ${({ theme }) => theme.colors.cardBackground};
  border-radius: 4px;
`;

const DebtUser = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  color: ${({ theme }) => theme.colors.text};
`;

const UserAvatar = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: ${({ theme }) => theme.colors.primary}20;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;

  svg {
    color: ${({ theme }) => theme.colors.primary};
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const UserName = styled.p`
  color: ${({ theme }) => theme.colors.text};
`;

const DebtAmount = styled.div`
  font-weight: 600;
  color: ${({ theme, $positive }) => 
    $positive ? theme.colors.success : theme.colors.danger};
`;

export default function DebtsList({ debts, owedToYou }) {
  return (
    <DebtsContainer>
      <DebtSection>
        <SectionTitle>
          <FiArrowDown style={{ color: '#10b981' }} /> Należności
        </SectionTitle>
        
        {owedToYou.length > 0 ? (
          owedToYou.map(debt => (
            <DebtItem key={debt.user._id}>
              <DebtUser>
                <UserAvatar>
                  {debt.user.profileImage ? (
                    <img 
                      src={
                        debt.user.profileImage.startsWith('/uploads') 
                          ? `${process.env.REACT_APP_API_URL.replace('/api', '')}${debt.user.profileImage}`
                          : `${process.env.REACT_APP_API_URL}/uploads/${debt.user.profileImage}`
                      } 
                      alt={debt.user.firstName}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '';
                      }}
                    />
                  ) : (
                    <FiUser size={16} />
                  )}
                </UserAvatar>
                <UserName>
                  {debt.user.firstName} {debt.user.lastName}
                </UserName>
              </DebtUser>
              <DebtAmount $positive>
                {debt.amount.toFixed(2)} PLN
              </DebtAmount>
            </DebtItem>
          ))
        ) : (
          <p style={{ color: '#6b7280' }}>Brak należności</p>
        )}
      </DebtSection>

      <DebtSection>
        <SectionTitle>
          <FiArrowUp style={{ color: '#ef4444' }} /> Twoje długi
        </SectionTitle>
        
        {debts.length > 0 ? (
          debts.map(debt => (
            <DebtItem key={debt.user._id}>
              <DebtUser>
                <UserAvatar>
                  {debt.user.profileImage ? (
                    <img 
                      src={
                        debt.user.profileImage.startsWith('/uploads') 
                          ? `${process.env.REACT_APP_API_URL.replace('/api', '')}${debt.user.profileImage}`
                          : `${process.env.REACT_APP_API_URL}/uploads/${debt.user.profileImage}`
                      } 
                      alt={debt.user.firstName}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '';
                      }}
                    />
                  ) : (
                    <FiUser size={16} />
                  )}
                </UserAvatar>
                <UserName>
                  {debt.user.firstName} {debt.user.lastName}
                </UserName>
              </DebtUser>
              <DebtAmount>
                {debt.amount.toFixed(2)} PLN
              </DebtAmount>
            </DebtItem>
          ))
        ) : (
          <p style={{ color: '#6b7280' }}>Brak długów</p>
        )}
      </DebtSection>
    </DebtsContainer>
  );
}