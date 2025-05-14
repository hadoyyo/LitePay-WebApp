import { useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FiArrowLeft } from 'react-icons/fi';
import axios from 'axios';
import { AuthContext } from '../../contexts/AuthContext';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import ExpenseForm from '../../components/expenses/ExpenseForm';
import ErrorMessage from '../../components/common/ErrorMessage';

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

export default function CreateExpensePage() {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const { user } = useContext(AuthContext);

  const initialValues = {
    title: '',
    amount: 0,
    date: new Date(),
    category: 'food',
    paidBy: user?._id || '',
    splitType: 'equal',
    shares: [],
    group: groupId
  };

  const handleSubmit = async (values) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/groups/${groupId}/expenses`,
        values,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      navigate(`/groups/${groupId}`);
    } catch (err) {
      console.error('Error creating expense:', err);
      setError(err.response?.data?.message || 'Wystąpił błąd podczas tworzenia wydatku');
    }
  };

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
      </Header>
      
      <Card>
        <Title>Nowy wydatek</Title>
        {error && <ErrorMessage message={error} />}
        <ExpenseForm 
          initialValues={initialValues} 
          onSubmit={handleSubmit}
          groupId={groupId}
        />
      </Card>
    </Container>
  );
}