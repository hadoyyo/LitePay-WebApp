import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FiDollarSign, FiCreditCard, FiTrendingUp } from 'react-icons/fi';
import axios from 'axios';
import Card from '../../components/common/Card';
import Tabs from '../../components/common/Tabs';
import ExpensesChart from '../../components/finances/ExpensesChart';
import DebtsList from '../../components/finances/DebtsList';
import Loader from '../../components/common/Loader';

const FinancesContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
  width: 100%;
  max-width: 100%;
  min-width: 0;
`;

const SummaryCards = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 1.5rem;
  width: 100%;
  min-width: 0;

  @media (max-width: 576px) {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
`;

const SummaryCard = styled.div`
  padding: 1.5rem;
  background-color: ${({ theme }) => theme.colors.cardBackground};
  border-radius: 20px;
  box-shadow: ${({ theme }) => theme.shadows.sm};
  min-width: 0;
  overflow: hidden;
`;

const SummaryCardTitle = styled.h3`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0;
  margin-bottom: 1rem;
  font-size: 1.4rem;
  color: ${({ theme }) => theme.colors.text};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const SummaryCardValue = styled.p`
  margin: 0;
  font-size: 2rem;
  font-weight: 600;
  color: ${({ theme, $positive }) => 
    $positive ? theme.colors.success : theme.colors.danger};
  word-break: break-word;
`;

const TabContent = styled.div`
  margin-top: 2rem;
  width: 100%;
  max-width: 100%;
  min-width: 0;
`;

const tabs = [
  { id: 'expenses', label: 'Wydatki', icon: <FiDollarSign /> },
  { id: 'debts', label: 'Długi', icon: <FiCreditCard /> }
];

export default function FinancesPage() {
  const [activeTab, setActiveTab] = useState('expenses');
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFinancialSummary = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/finances/summary`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        setSummary(response.data.data);
      } catch (err) {
        console.error('Error fetching financial summary:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFinancialSummary();
  }, []);

  if (loading || !summary) {
    return <Loader />;
  }

  return (
    <FinancesContainer>
      <h1>Podsumowanie finansowe</h1>

      <SummaryCards>
        <SummaryCard>
          <SummaryCardTitle>
            <FiDollarSign /> Twoje wydatki
          </SummaryCardTitle>
          <SummaryCardValue>
            {summary.totalExpenses.toFixed(2)} PLN
          </SummaryCardValue>
        </SummaryCard>

        <SummaryCard>
          <SummaryCardTitle>
            <FiTrendingUp /> Należności
          </SummaryCardTitle>
          <SummaryCardValue $positive>
            {summary.totalOwedToYou.toFixed(2)} PLN
          </SummaryCardValue>
        </SummaryCard>

        <SummaryCard>
          <SummaryCardTitle>
            <FiCreditCard /> Długi
          </SummaryCardTitle>
          <SummaryCardValue>
            {summary.totalYouOwe.toFixed(2)} PLN
          </SummaryCardValue>
        </SummaryCard>

        <SummaryCard>
          <SummaryCardTitle>
            <FiTrendingUp /> Saldo
          </SummaryCardTitle>
          <SummaryCardValue $positive={summary.netBalance >= 0}>
            {summary.netBalance.toFixed(2)} PLN
          </SummaryCardValue>
        </SummaryCard>
      </SummaryCards>

      <Card>
        <Tabs 
          tabs={tabs} 
          activeTab={activeTab} 
          onTabChange={setActiveTab} 
        />

        <TabContent>
          {activeTab === 'expenses' && (
            <ExpensesChart expenses={summary.expensesByPeriod} />
          )}
          {activeTab === 'debts' && (
            <DebtsList 
              debts={summary.debts} 
              owedToYou={summary.owedToYou} 
            />
          )}
        </TabContent>
      </Card>
    </FinancesContainer>
  );
}