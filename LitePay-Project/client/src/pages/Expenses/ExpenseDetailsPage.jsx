import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FiEdit2, FiTrash2, FiArrowLeft, FiDollarSign, FiUser, FiCalendar } from 'react-icons/fi';
import axios from 'axios';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import ExpenseForm from '../../components/expenses/ExpenseForm';

const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const Title = styled.h2`
  margin-bottom: 2rem;
  color: ${({ theme }) => theme.colors.text};
`;

const FieldLabel = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-size: 1.4rem;
  color: #6b7280;
`;

const FieldValue = styled.div`
  padding: 0.75rem 1rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 16px;
  background-color: ${({ theme }) => theme.colors.background};
`;

const FieldContainer = styled.div`
  margin-bottom: 1rem;
`;

const SharesTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 1.5rem;
`;

const SharesTableHeader = styled.th`
  text-align: left;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const SharesTableCell = styled.td`
  padding: 0.75rem 1rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const getCategoryLabel = (category) => {
  switch (category) {
    case 'food': return '🍕 Jedzenie';
    case 'transport': return '🚗 Transport';
    case 'shopping': return '🛍️ Zakupy';
    case 'entertainment': return '🎬 Rozrywka';
    case 'bills': return '📄 Rachunki';
    case 'accommodation': return '🛏️ Zakwaterowanie';
    default: return '💵 Inne';
  }
};

export default function ExpenseDetailsPage() {
  const { expenseId } = useParams();
  const navigate = useNavigate();
  const [expense, setExpense] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState(null);
  const [groupId, setGroupId] = useState(null);

  useEffect(() => {
    const fetchExpense = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/expenses/${expenseId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        setExpense(response.data.data);
        setGroupId(response.data.data.group._id || response.data.data.group);
      } catch (err) {
        console.error('Error fetching expense:', err);
        setError('Nie udało się załadować danych wydatku');
      } finally {
        setLoading(false);
      }
    };

    fetchExpense();
  }, [expenseId]);

  const handleDelete = async () => {
    if (window.confirm('Czy na pewno chcesz usunąć ten wydatek?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(
          `${process.env.REACT_APP_API_URL}/expenses/${expenseId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        navigate(`/groups/${groupId}`);
      } catch (err) {
        console.error('Error deleting expense:', err);
        setError('Wystąpił błąd podczas usuwania wydatku');
      }
    }
  };

  const handleUpdate = async (values) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${process.env.REACT_APP_API_URL}/expenses/${expenseId}`,
        values,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      navigate(`/groups/${groupId}`);
    } catch (err) {
      console.error('Error updating expense:', err);
      setError('Wystąpił błąd podczas aktualizacji wydatku');
    }
  };

  if (loading) {
    return <div></div>;
  }

  if (!expense) {
    return <div>Nie znaleziono wydatku</div>;
  }

  if (isEditing) {
    return (
      <Container>
        <Header>
          <Button 
            variant="outline" 
            icon={<FiArrowLeft />}
            onClick={() => setIsEditing(false)}
          >
            Powrót
          </Button>
        </Header>

        <Card>
          <Title>Edytuj wydatek</Title>
          <ExpenseForm 
            initialValues={{
              title: expense.title,
              amount: expense.amount,
              date: new Date(expense.date),
              category: expense.category,
              paidBy: expense.paidBy._id || expense.paidBy,
              splitType: expense.splitType,
              shares: expense.shares,
              group: groupId
            }}
            onSubmit={handleUpdate}
            onCancel={() => setIsEditing(false)}
            groupId={groupId}
            isEditing={true}
          />
        </Card>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Button 
          variant="outline" 
          icon={<FiArrowLeft />}
          onClick={() => navigate(`/groups/${groupId}`)}
        >
          Powrót
        </Button>
        
        <div>
          <Button 
            variant="primary" 
            icon={<FiEdit2 />}
            onClick={() => setIsEditing(true)}
            style={{ marginRight: '1rem' }}
          >
            Edytuj
          </Button>
          <Button 
            variant="danger" 
            icon={<FiTrash2 />}
            onClick={handleDelete}
          >
            Usuń
          </Button>
        </div>
      </Header>

      {error && <div style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>}

      <Card>
        <Title>Dane wydatku</Title>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <FieldContainer>
            <FieldLabel>Tytuł</FieldLabel>
            <FieldValue>{expense.title}</FieldValue>
          </FieldContainer>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <FieldContainer>
              <FieldLabel>Kwota</FieldLabel>
              <FieldValue>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <FiDollarSign /> {expense.amount.toFixed(2)} zł
                </div>
              </FieldValue>
            </FieldContainer>

            <FieldContainer>
              <FieldLabel>Kategoria</FieldLabel>
              <FieldValue>{getCategoryLabel(expense.category)}</FieldValue>
            </FieldContainer>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <FieldContainer>
              <FieldLabel>Data</FieldLabel>
              <FieldValue>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <FiCalendar /> {new Date(expense.date).toLocaleDateString()}
                </div>
              </FieldValue>
            </FieldContainer>

            <FieldContainer>
              <FieldLabel>Zapłacono przez</FieldLabel>
              <FieldValue>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <FiUser /> {expense.paidBy.firstName} {expense.paidBy.lastName}
                </div>
              </FieldValue>
            </FieldContainer>
          </div>

          <FieldContainer>
            <SharesTable>
              <thead>
                <tr>
                  <SharesTableHeader>Zapłacono za</SharesTableHeader>
                  <SharesTableHeader>Kwota</SharesTableHeader>
                </tr>
              </thead>
              <tbody>
                {expense.shares?.map((share, index) => (
                  <tr key={index}>
                    <SharesTableCell>
                      {share.user?.firstName} {share.user?.lastName}
                    </SharesTableCell>
                    <SharesTableCell>
                      {share.amount.toFixed(2)} zł
                    </SharesTableCell>
                  </tr>
                ))}
              </tbody>
            </SharesTable>
          </FieldContainer>
        </div>
      </Card>
    </Container>
  );
}