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
  height: 4.2rem;
  padding: 1rem 2.5rem 1rem ${({ $hasIcon }) => ($hasIcon ? '3.4rem' : '1rem')};
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
  color: ${({ theme }) => theme.colors.textSecondary};
  pointer-events: none;
  display: flex;
  align-items: center;
`;

const ChevronWrapper = styled.span`
  position: absolute;
  right: 1rem;
  font-size: 1.8rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  pointer-events: none;
  display: flex;
  align-items: center;
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
          $hasIcon={!!icon}
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
