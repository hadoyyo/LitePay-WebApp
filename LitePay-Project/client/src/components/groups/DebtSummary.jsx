import { useAuth } from '../../contexts/AuthContext';
import styled from 'styled-components';
import { FiDollarSign, FiUser, FiPieChart } from 'react-icons/fi';

const SummaryContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 1.5rem;
  margin-bottom: 1.5rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const SummaryItem = styled.div`
  padding: 1.5rem;
  border-radius: 20px;
  background-color: ${({ theme }) => theme.colors.background};
`;

const SummaryTitle = styled.h4`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0;
  margin-bottom: 1rem;
  color: ${({ theme }) => theme.colors.text};
`;

const SummaryValue = styled.p`
  margin: 0;
  font-size: 1.8rem;
  font-weight: 600;
  color: ${({ theme, $positive }) => 
    $positive ? theme.colors.success : theme.colors.danger};
`;

const SummaryValueNeutral = styled.p`
  margin: 0;
  font-size: 1.8rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.primary};
`;

const UserDebt = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px dashed ${({ theme }) => theme.colors.border};

  &:last-child {
    border-bottom: none;
  }
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: ${({ theme }) => theme.colors.text}
`;

const UserAvatar = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: ${({ theme }) => theme.colors.primary}20;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;

  svg {
    color: ${({ theme }) => theme.colors.primary};
    font-size: 1.4rem;
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const DebtAmount = styled.span`
  font-weight: 500;
  color: ${({ theme, $positive }) => 
    $positive ? theme.colors.success : theme.colors.danger};
`;

const EmptyMessage = styled.p`
  text-align: center;
  color: #6b7280;
  margin: 1rem 0;
`;

export default function DebtSummary({ expenses, group }) {
  const { user } = useAuth();
  const currentUserId = user?._id;

  const totalGroupExpenses = expenses.reduce((sum, expense) => {
    return sum + parseFloat(expense.amount || 0);
  }, 0);

  const calculateNetBalances = () => {
    const balances = {};
    
    if (!currentUserId || !group?.members) return balances;

    balances[currentUserId] = 0;

    expenses.forEach(expense => {
      const paidById = expense.paidBy?._id || expense.paidBy;
      
      if (!expense.shares || !Array.isArray(expense.shares)) return;
      
      expense.shares.forEach(share => {
        const shareUserId = share.user?._id || share.user;
        const shareAmount = parseFloat(share.amount || 0);
        
        if (shareUserId === currentUserId || paidById === currentUserId) {
          if (shareUserId !== paidById) {
            if (paidById === currentUserId) {
              balances[shareUserId] = (balances[shareUserId] || 0) + shareAmount;
            } else if (shareUserId === currentUserId) {
              balances[paidById] = (balances[paidById] || 0) - shareAmount;
            }
          }
        }
      });
    });
    
    return balances;
  };

  const balances = calculateNetBalances();
  
  const yourNetDebts = [];
  const yourNetCredits = [];
  let totalYouOwe = 0;
  let totalOwedToYou = 0;

  if (currentUserId && balances && group?.members) {
    Object.entries(balances).forEach(([userId, balance]) => {
      if (userId === currentUserId || balance === 0) return;
      
      const user = group.members.find(m => m._id === userId);
      if (!user) return;
      
      if (balance > 0) {
        yourNetCredits.push({ user, amount: balance });
        totalOwedToYou += balance;
      } else if (balance < 0) {
        yourNetDebts.push({ user, amount: Math.abs(balance) });
        totalYouOwe += Math.abs(balance);
      }
    });

    yourNetDebts.sort((a, b) => b.amount - a.amount);
    yourNetCredits.sort((a, b) => b.amount - a.amount);
  }

  return (
    <div>
      <SummaryContainer>
        <SummaryItem>
          <SummaryTitle>
            <FiPieChart /> Wydatki grupy
          </SummaryTitle>
          <SummaryValueNeutral>
            {totalGroupExpenses.toFixed(2)} PLN
          </SummaryValueNeutral>
        </SummaryItem>

        <SummaryItem>
          <SummaryTitle>
            <FiDollarSign /> Długi
          </SummaryTitle>
          <SummaryValue>
            {totalYouOwe.toFixed(2)} PLN
          </SummaryValue>
        </SummaryItem>

        <SummaryItem>
          <SummaryTitle>
            <FiDollarSign /> Należności
          </SummaryTitle>
          <SummaryValue $positive>
            {totalOwedToYou.toFixed(2)} PLN
          </SummaryValue>
        </SummaryItem>
      </SummaryContainer>

      <div style={{ marginTop: '1.5rem' }}>
        <SummaryTitle>
          <FiUser /> Twoje długi
        </SummaryTitle>
        {yourNetDebts.length > 0 ? (
          yourNetDebts.map((debt, index) => (
            <UserDebt key={index}>
              <UserInfo>
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
                    <FiUser size={14} />
                  )}
                </UserAvatar>
                {debt.user.firstName} {debt.user.lastName}
              </UserInfo>
              <DebtAmount>{debt.amount.toFixed(2)} PLN</DebtAmount>
            </UserDebt>
          ))
        ) : (
          <EmptyMessage>Nie masz żadnych długów w tej grupie</EmptyMessage>
        )}
      </div>

      <div style={{ marginTop: '1.5rem' }}>
        <SummaryTitle>
          <FiUser /> Twoje należności
        </SummaryTitle>
        {yourNetCredits.length > 0 ? (
          yourNetCredits.map((credit, index) => (
            <UserDebt key={index}>
              <UserInfo>
                <UserAvatar>
                  {credit.user.profileImage ? (
                    <img 
                      src={
                        credit.user.profileImage.startsWith('/uploads') 
                          ? `${process.env.REACT_APP_API_URL.replace('/api', '')}${credit.user.profileImage}`
                          : `${process.env.REACT_APP_API_URL}/uploads/${credit.user.profileImage}`
                      } 
                      alt={credit.user.firstName}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '';
                      }}
                    />
                  ) : (
                    <FiUser size={14} />
                  )}
                </UserAvatar>
                {credit.user.firstName} {credit.user.lastName}
              </UserInfo>
              <DebtAmount $positive>{credit.amount.toFixed(2)} PLN</DebtAmount>
            </UserDebt>
          ))
        ) : (
          <EmptyMessage>Nikt nie jest Ci winien pieniędzy w tej grupie</EmptyMessage>
        )}
      </div>
    </div>
  );
}