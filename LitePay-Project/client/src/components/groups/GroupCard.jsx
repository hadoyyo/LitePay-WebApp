import { FiUser } from 'react-icons/fi';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { FiUsers } from 'react-icons/fi';

const CardLink = styled(Link)`
  background-color: ${({ theme }) => theme.colors.cardBackground};
  border-radius: 20px;
  box-shadow: ${({ theme }) => theme.shadows.md};
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  display: block;
  text-decoration: none;
  color: inherit;

  &:hover {
    transform: translateY(-5px);
    box-shadow: ${({ theme }) => theme.shadows.md};
  }
`;

const CardHeader = styled.div`
  background-color: ${({ $color }) => $color};
  padding: 1.5rem;
  color: white;
`;

const CardTitle = styled.h3`
  margin: 0;
  font-size: 1.6rem;
`;

const CardBody = styled.div`
  padding: 1.5rem;
`;

const MembersList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 1rem;
`;

const MemberAvatar = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: ${({ theme }) => theme.colors.primary}20;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  svg {
    color: ${({ theme }) => theme.colors.primary};
  }
`;

export default function GroupCard({ group }) {
  const getMembersText = (count) => {
    return count === 1 ? '1 członek' : `${count} członków`;
  };

  return (
    <CardLink to={`/groups/${group._id}`}>
      <CardHeader $color={group.color}>
        <CardTitle>{group.name}</CardTitle>
      </CardHeader>
      
      <CardBody>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <FiUsers />
          <span>{getMembersText(group.members.length)}</span>
        </div>
        
        <MembersList>
          {group.members.map(member => (
            <MemberAvatar key={member._id} title={`${member.firstName} ${member.lastName}`}>
              {member.profileImage ? (
                <img 
                  src={
                    member.profileImage.startsWith('/uploads') 
                      ? `${process.env.REACT_APP_API_URL.replace('/api', '')}${member.profileImage}`
                      : `${process.env.REACT_APP_API_URL}/uploads/${member.profileImage}`
                  } 
                  alt={member.firstName}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '';
                  }}
                />
              ) : (
                <FiUser size={14} />
              )}
            </MemberAvatar>
          ))}
        </MembersList>
      </CardBody>
    </CardLink>
  );
}