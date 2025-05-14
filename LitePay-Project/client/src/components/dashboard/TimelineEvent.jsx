import styled from 'styled-components';
import { formatDistanceToNow } from 'date-fns';
import { pl } from 'date-fns/locale';
import { FiUser, FiDollarSign, FiUsers } from 'react-icons/fi';

const EventContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 1.5rem 0;
  border-bottom: ${({ islast, theme }) => 
    islast ? 'none' : `1px solid ${theme.colors.border}`};
`;

const EventIcon = styled.div`
  width: 4rem;
  height: 4rem;
  min-width: 4rem;
  min-height: 4rem;
  border-radius: 50%;
  background-color: ${({ theme }) => theme.colors.primary}20;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  svg {
    color: ${({ theme }) => theme.colors.primary};
    font-size: 1.8rem;
    width: 1.8rem;
    height: 1.8rem;
  }
`;

const EventContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const EventMessage = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.text};
  line-height: 1.4;
`;

const EventMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 1.2rem;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const getEventIcon = (type) => {
  switch (type) {
    case 'expense_added':
    case 'expense_modified':
    case 'expense_deleted':
      return <FiDollarSign />;
    case 'group_created':
    case 'group_joined':
    case 'invitation_received':
      return <FiUsers />;
    default:
      return <FiUser />;
  }
};

export default function TimelineEvent({ event, islast }) {
  return (
    <EventContainer islast={islast}>
      <EventIcon>
        {getEventIcon(event.type)}
      </EventIcon>
      <EventContent>
        <EventMessage>{event.message}</EventMessage>
        <EventMeta>
          {formatDistanceToNow(new Date(event.createdAt), { 
            addSuffix: true, 
            locale: pl 
          })}
        </EventMeta>
      </EventContent>
    </EventContainer>
  );
}