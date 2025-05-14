import styled from 'styled-components';

const TabsContainer = styled.div`
  display: flex;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const Tab = styled.button`
  padding: 0.75rem 1.5rem;
  background: none;
  border: none;
  border-bottom: 3px solid ${({ theme, $active }) => 
    $active ? theme.colors.primary : 'transparent'};
  color: ${({ theme, $active }) => 
    $active ? theme.colors.primary : theme.colors.textSecondary};
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;

  &:hover {
    color: ${({ theme }) => theme.colors.primary};
  }
`;

export default function Tabs({ tabs, activeTab, onTabChange }) {
  return (
    <TabsContainer>
      {tabs.map(tab => (
        <Tab
          key={tab.id}
          $active={activeTab === tab.id}
          onClick={() => onTabChange(tab.id)}
        >
          {tab.icon}
          {tab.label}
        </Tab>
      ))}
    </TabsContainer>
  );
}