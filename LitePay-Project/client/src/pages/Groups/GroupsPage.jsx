import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { FiUsers, FiPlus } from 'react-icons/fi';
import axios from 'axios';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import GroupCard from '../../components/groups/GroupCard';

const GroupsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;

  @media (min-width: 800px) {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
`;

const GroupsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 2rem;
`;

const EmptyMessage = styled.div`
  text-align: center;
  padding: 3rem;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

export default function GroupsPage() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/groups`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setGroups(response.data.data);
      } catch (err) {
        console.error('Error fetching groups:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchGroups();
  }, []);

  const handleDeleteGroup = async (groupId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${process.env.REACT_APP_API_URL}/groups/${groupId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setGroups(groups.filter(group => group._id !== groupId));
    } catch (err) {
      console.error('Error deleting group:', err);
    }
  };

  if (loading) {
    return <div></div>;
  }

  return (
    <GroupsContainer>
      <Header>
        <h1>Moje grupy</h1>
        <Button as={Link} to="/groups/create" variant="primary" icon={<FiPlus />}>
          Nowa grupa
        </Button>
      </Header>

      {groups.length === 0 ? (
        <Card>
          <EmptyMessage>
            <FiUsers size={48} />
            <h3>Nie należysz jeszcze do żadnej grupy</h3>
            <p>Utwórz nową grupę lub dołącz do istniejącej</p>
            <br></br>
            <Button as={Link} to="/groups/create" variant="primary" icon={<FiPlus />}>
              Utwórz grupę
            </Button>
          </EmptyMessage>
        </Card>
      ) : (
        <GroupsGrid>
          {groups.map(group => (
            <GroupCard 
              key={group._id} 
              group={group} 
              onDelete={() => handleDeleteGroup(group._id)} 
            />
          ))}
        </GroupsGrid>
      )}
    </GroupsContainer>
  );
}