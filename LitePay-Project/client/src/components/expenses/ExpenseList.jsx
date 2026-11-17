import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';

const categories = [
  { value: 'food', label: '🍕' },
  { value: 'transport', label: '🚗' },
  { value: 'shopping', label: '🛍️' },
  { value: 'entertainment', label: '🎬' },
  { value: 'bills', label: '📄' },
  { value: 'accommodation', label: '🛏️' },
  { value: 'other', label: '💵' }
];

const ExpenseLink = styled(Link)`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  text-decoration: none;
  color: inherit;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background-color: ${({ theme }) => theme.colors.backgroundHover};
  }
`;

const ExpenseInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;
  flex: 1;
  min-width: 0;
`;

const ExpenseIcon = styled.div`
  width: 4rem;
  height: 4rem;
  border-radius: 50%;
  background-color: ${({ theme }) => theme.colors.primary}20;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.8rem;
  line-height: 1;
  padding: 0;
  flex-shrink: 0;
`;

const ExpenseDetails = styled.div`
  flex: 1;
  min-width: 0;
`;

const ExpenseTitle = styled.p`
  margin: 0;
  font-size: 1.6rem;
  color: ${({ theme }) => theme.colors.text};
`;

const ExpenseMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.2rem;
  color: ${({ theme }) => theme.colors.textSecondary};

  @media (max-width: 450px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.2rem;
  }
`;

const ExpenseDate = styled.span`
  white-space: nowrap;
`;

const Separator = styled.span`
  display: inline-flex;
  align-items: center;
  line-height: 1;
  transform: translateY(-0.1rem);

  @media (max-width: 450px) {
    display: none;
  }
`;

const ExpensePerson = styled.span`
  white-space: nowrap;

  @media (max-width: 576px) {
    display: none;
  }
`;

const ExpensePersonMobile = styled.span`
  display: none;
  white-space: nowrap;

  @media (max-width: 576px) {
    display: inline;
  }
`;

const ExpenseAmount = styled.div`
  font-weight: 600;
  color: ${({ theme }) => theme.colors.primary};
  margin-left: 1rem;
  white-space: nowrap;
  flex-shrink: 0;
`;

const getCategoryEmoji = (categoryValue) => {
  const category = categories.find(cat => cat.value === categoryValue);
  return category ? category.label : '💵';
};

export default function ExpenseList({ expenses, onDelete, groupId }) {
   return (
    <div>
      {expenses.map(expense => (
        <ExpenseLink to={`/expenses/${expense._id}`} key={expense._id}>
          <ExpenseInfo>
            <ExpenseIcon>
              {getCategoryEmoji(expense.category)}
            </ExpenseIcon>
            <ExpenseDetails>
              <ExpenseTitle>{expense.title}</ExpenseTitle>
              <ExpenseMeta>
                <ExpenseDate>
                  {format(new Date(expense.date), 'dd MMM yyyy', { locale: pl })}
                </ExpenseDate>
                <Separator>•</Separator>
                <ExpensePerson>
                  {expense.paidBy.firstName} {expense.paidBy.lastName}
                </ExpensePerson>
                <ExpensePersonMobile>
                  {expense.paidBy.firstName}
                </ExpensePersonMobile>
              </ExpenseMeta>
            </ExpenseDetails>
          </ExpenseInfo>
          <ExpenseAmount>{expense.amount.toFixed(2)} PLN</ExpenseAmount>
        </ExpenseLink>
      ))}
    </div>
  );
}