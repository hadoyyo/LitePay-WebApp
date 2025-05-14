import styled from 'styled-components';
import { FiX } from 'react-icons/fi';
import { useState, useEffect } from 'react';

const SelectorContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const SelectedUsers = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.5rem;
`;

const UserTag = styled.div`
  display: inline-flex;
  align-items: center;
  background-color: ${({ theme }) => theme.colors.primary}20;
  padding: 0.5rem 1rem;
  border-radius: 20px;
`;

const RemoveButton = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.danger};
  margin-left: 0.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 1rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 4px;
  font-size: 1.4rem;
`;

const SearchResults = styled.div`
  margin-top: 0.5rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 4px;
  max-height: 200px;
  overflow-y: auto;
`;

const SearchResultItem = styled.div`
  padding: 1rem;
  cursor: pointer;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: ${({ theme }) => theme.colors.background};
  }
`;

export default function UserSelector({ 
  users, 
  selectedUsers = [], 
  onSelect, 
  onRemove 
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => {
    if (searchQuery.length > 1) {
      const results = users.filter(user => 
        !selectedUsers.some(selected => selected._id === user._id) &&
        (user.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.username.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, users, selectedUsers]);

  const handleSelect = (user) => {
    onSelect(user);
    setSearchQuery('');
  };

  return (
    <SelectorContainer>
      <SearchInput
        type="text"
        placeholder="Wyszukaj użytkowników..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />

      {selectedUsers.length > 0 && (
        <SelectedUsers>
          {selectedUsers.map(user => (
            <UserTag key={user._id}>
              {user.firstName} {user.lastName}
              <RemoveButton onClick={() => onRemove(user._id)}>
                <FiX />
              </RemoveButton>
            </UserTag>
          ))}
        </SelectedUsers>
      )}

      {searchResults.length > 0 && (
        <SearchResults>
          {searchResults.map(user => (
            <SearchResultItem 
              key={user._id} 
              onClick={() => handleSelect(user)}
            >
              {user.firstName} {user.lastName} (@{user.username})
            </SearchResultItem>
          ))}
        </SearchResults>
      )}
    </SelectorContainer>
  );
}