import styled from 'styled-components';
import Button from '../common/Button';
import { FiUser, FiCheck, FiX } from 'react-icons/fi';

const InvitationContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};

  &:last-child {
    border-bottom: none;
  }
`;

const InvitationInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const InvitationIcon = styled.div`
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

const InvitationText = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.text};
`;

const InvitationActions = styled.div`
  display: flex;
  gap: 1rem;
`;

export default function InvitationItem({ invitation, onResponse }) {
  const handleResponse = async (accepted) => {
    try {
      await onResponse(invitation._id, accepted);
    } catch (error) {
      console.error('Error handling invitation response:', error);
    }
  };

  return (
    <InvitationContainer>
      <InvitationInfo>
        <InvitationIcon>
          <FiUser />
        </InvitationIcon>
        <InvitationText>
          Zostałeś zaproszony do grupy <strong>{invitation.group.name}</strong> przez użytkownika{' '}
          <strong>{invitation.invitedBy.firstName} {invitation.invitedBy.lastName}</strong>
        </InvitationText>
      </InvitationInfo>
      
      <InvitationActions>
        <Button 
          variant="primary" 
          size="sm" 
          icon={<FiCheck />}
          onClick={() => handleResponse(true)}
        />
        <Button 
          variant="danger" 
          size="sm" 
          icon={<FiX />}
          onClick={() => handleResponse(false)}
        />
      </InvitationActions>
    </InvitationContainer>
  );
}