import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FiSearch, FiUser, FiUserPlus  } from 'react-icons/fi';
import axios from 'axios';
import Button from '../common/Button';
import Modal from '../common/Modal';

const SearchContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const SearchInput = styled.div`
  position: relative;
  display: flex;
  align-items: center;

  input {
    width: 100%;
    padding: 1rem 1rem 1rem 3rem;
    border: 1px solid ${({ theme }) => theme.colors.border};
    border-radius: 8px;
    font-size: 1.6rem;
  }

  svg {
    position: absolute;
    left: 1rem;
    color: ${({ theme }) => theme.colors.textSecondary};
  }
`;

const UsersList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-height: 300px;
  overflow-y: auto;
`;

const UserItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  border-radius: 8px;
  background-color: ${({ theme }) => theme.colors.backgroundSecondary};
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const UserAvatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: ${({ theme }) => theme.colors.primary}20;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;

  svg {
    color: ${({ theme }) => theme.colors.primary};
    font-size: 1.6rem;
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const UserDetails = styled.div`
  display: flex;
  flex-direction: column;
`;

const UserName = styled.p`
  margin: 0;
  font-size: 1.6rem;
  color: ${({ theme }) => theme.colors.text};
`;

const Username = styled.p`
  margin: 0;
  font-size: 1.4rem;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const StatusMessage = styled.p`
  text-align: center;
  color: ${({ theme }) => theme.colors.success};
  padding: 0.5rem 0;
  margin: 0;
`;

const ErrorMessage = styled.p`
  color: ${({ theme }) => theme.colors.danger};
  text-align: center;
  margin-top: 1rem;
`;

const LoadingMessage = styled.p`
  text-align: center;
  color: ${({ theme }) => theme.colors.textSecondary};
  padding: 2rem 0;
`;

export default function InviteMembersModal({ groupId, groupName, isOpen, onClose }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [pendingInvitations, setPendingInvitations] = useState([]);

  useEffect(() => {
    if (isOpen) {
      const fetchPendingInvitations = async () => {
        try {
          const token = localStorage.getItem('token');
          const response = await axios.get(
            `${process.env.REACT_APP_API_URL}/groups/${groupId}/pending-invitations`,
            {
              headers: {
                Authorization: `Bearer ${token}`
              }
            }
          );
          setPendingInvitations(response.data.data);
        } catch (err) {
          console.error('Error fetching pending invitations:', err);
        }
      };
      fetchPendingInvitations();
    } else {
      setSearchQuery('');
      setSearchResults([]);
      setSuccess(null);
      setError(null);
    }
  }, [groupId, isOpen]);

  useEffect(() => {
    const searchUsers = async () => {
  if (searchQuery.trim().length < 2) {
    setSearchResults([]);
    setSuccess(null);
    return;
  }

  try {
    setLoading(true);
    setError(null);
    const token = localStorage.getItem('token');
    
    const groupResponse = await axios.get(
      `${process.env.REACT_APP_API_URL}/groups/${groupId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    
    const currentMembers = groupResponse.data.data.members.map(m => m._id);

    const response = await axios.get(
      `${process.env.REACT_APP_API_URL}/users/search?q=${searchQuery}`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    
    // Wykluczone wyniki:
    // 1. Członkowie grupy
    // 2. Użytkownicy z oczekującymi zaproszeniami
    const filteredResults = response.data.data.filter(user => 
      !currentMembers.includes(user._id) && 
      !pendingInvitations.some(inv => inv.invitedUser._id === user._id)
    );
    
    setSearchResults(filteredResults);
  } catch (err) {
    console.error('Error searching users:', err);
    setError(err.response?.data?.error || 'Failed to search users');
  } finally {
    setLoading(false);
  }
};

    const debounceTimer = setTimeout(() => {
      searchUsers();
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery, pendingInvitations]);

  const handleInvite = async (userId) => {
  try {
    setError(null);
    const token = localStorage.getItem('token');
    
    const checkResponse = await axios.get(
      `${process.env.REACT_APP_API_URL}/groups/${groupId}/members/${userId}/status`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    if (checkResponse.data.data.isMember) {
      setError('Ten użytkownik jest już członkiem grupy');
      return;
    }

    if (checkResponse.data.data.hasPendingInvitation) {
      setError('Ten użytkownik ma już oczekujące zaproszenie');
      return;
    }

    await axios.post(
      `${process.env.REACT_APP_API_URL}/groups/${groupId}/invite`,
      { userId },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    
    setSuccess(`Zaproszenie zostało wysłane`);
    setSearchResults(searchResults.filter(user => user._id !== userId));
    
    const newPendingInvitation = {
      _id: Date.now().toString(),
      invitedUser: { _id: userId }
    };
    setPendingInvitations([...pendingInvitations, newPendingInvitation]);
  } catch (err) {
    console.error('Error sending invitation:', err);
    setError(err.response?.data?.error || 'Failed to send invitation');
  }
};

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Zaproś do grupy ${groupName}`}
    >
      <SearchContainer>
        <SearchInput>
          <FiSearch size={20} />
          <input
            type="text"
            placeholder="Wyszukaj użytkowników (min. 2 znaki)..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setSuccess(null);
            }}
            autoFocus
          />
        </SearchInput>

        {error && <ErrorMessage>{error}</ErrorMessage>}
        {success && <StatusMessage>{success}</StatusMessage>}

        {loading ? (
          <LoadingMessage>Wyszukiwanie...</LoadingMessage>
        ) : searchResults.length > 0 ? (
          <UsersList>
            {searchResults.map(user => (
              <UserItem key={user._id}>
                <UserInfo>
                  <UserAvatar>
                    {user.profileImage ? (
                      <img 
                        src={
                          user.profileImage.startsWith('/uploads') 
                            ? `${process.env.REACT_APP_API_URL.replace('/api', '')}${user.profileImage}`
                            : `${process.env.REACT_APP_API_URL}/uploads/${user.profileImage}`
                        } 
                        alt={`${user.firstName} ${user.lastName}`}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = '';
                        }}
                      />
                    ) : (
                      <FiUser size={16} />
                    )}
                  </UserAvatar>
                  <UserDetails>
                    <UserName>{user.firstName} {user.lastName}</UserName>
                    <Username>@{user.username}</Username>
                  </UserDetails>
                </UserInfo>
                <Button 
                  variant="primary" 
                  size="sm"
                  icon={<FiUserPlus />}
                  onClick={() => handleInvite(user._id)}
                >
                  Zaproś
                </Button>
              </UserItem>
            ))}
          </UsersList>
        ) : (
          <LoadingMessage>
            {searchQuery.trim().length >= 2 
              ? 'Nie znaleziono użytkowników' 
              : 'Wprowadź minimum 2 znaki aby wyszukać użytkowników'}
          </LoadingMessage>
        )}
      </SearchContainer>
    </Modal>
  );
}