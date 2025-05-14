import styled from 'styled-components';
import { FiChevronDown } from 'react-icons/fi';

const SelectContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-size: 1.4rem;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const SelectWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const StyledSelect = styled.select`
  width: 100%;
  padding: 1rem 1rem 1rem 3rem;
  border: 1px solid ${({ theme, $error }) => 
    $error ? theme.colors.danger : theme.colors.border};
  border-radius: 16px;
  font-size: 1.4rem;
  background-color: ${({ theme }) => theme.colors.cardBackground};
  color: ${({ theme }) => theme.colors.text};
  cursor: pointer;
  appearance: none;
  
  &:focus {
    outline: none;
    border-color: ${({ theme, $error }) => 
      $error ? theme.colors.danger : theme.colors.primary};
  }
`;

const IconWrapper = styled.span`
  position: absolute;
  left: 1rem;
  font-size: 1.8rem;
  margin-top: 0.5rem;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const ChevronWrapper = styled.span`
  position: absolute;
  right: 1rem;
  font-size: 1.8rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  pointer-events: none;
`;

export default function SelectInput({ 
  value, 
  onChange, 
  options, 
  label,
  icon,
  error,
  ...props 
}) {
  return (
    <SelectContainer>
      {label && <Label>{label}</Label>}
      <SelectWrapper>
        {icon && <IconWrapper>{icon}</IconWrapper>}
        <StyledSelect 
          value={value} 
          onChange={onChange}
          $error={error}
          {...props}
        >
          {options.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </StyledSelect>
        <ChevronWrapper>
          <FiChevronDown />
        </ChevronWrapper>
      </SelectWrapper>
    </SelectContainer>
  );
}