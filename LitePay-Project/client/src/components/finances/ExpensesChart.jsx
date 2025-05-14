import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend 
} from 'chart.js';
import styled from 'styled-components';
import { useState } from 'react';
import Button from '../common/Button';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const ChartContainer = styled.div`
  position: relative;
  height: 400px;
  margin-bottom: 7.5rem;
`;

const ChartControls = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1rem;

  @media (min-width: 768px) {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
`;

const PeriodButtons = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
  justify-content: center;

  @media (min-width: 768px) {
    margin-bottom: 0;
    justify-content: flex-start;
  }
`;

export default function ExpensesChart({ expenses }) {
  const [period, setPeriod] = useState('daily');

  const getChartData = () => {
    const periodData = expenses[period] || [];
    
    return {
      labels: periodData.map(item => item.label),
      datasets: [
        {
          label: 'Wydatki (PLN)',
          data: periodData.map(item => item.amount),
          backgroundColor: '#3b82f6',
          borderRadius: 4
        }
      ]
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            return `${context.raw.toFixed(2)} PLN`;
          }
        }
      }
    },
    scales: {
      x: {
      grid: {
        display: false
      }
    },
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value) => `${value} PLN`
        }
      }
    }
  };

  return (
    <ChartContainer>
      <ChartControls>
        <PeriodButtons>
          <Button 
            variant={period === 'daily' ? 'primary' : 'outline'} 
            size="sm"
            onClick={() => setPeriod('daily')}
          >
            Dzienne
          </Button>
          <Button 
            variant={period === 'monthly' ? 'primary' : 'outline'} 
            size="sm"
            onClick={() => setPeriod('monthly')}
          >
            Miesięczne
          </Button>
          <Button 
            variant={period === 'yearly' ? 'primary' : 'outline'} 
            size="sm"
            onClick={() => setPeriod('yearly')}
          >
            Roczne
          </Button>
        </PeriodButtons>
      </ChartControls>

      <Bar data={getChartData()} options={chartOptions} />
    </ChartContainer>
  );
}