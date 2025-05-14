import styled from 'styled-components';

const InputContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-size: 1.4rem;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const InputWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const InputIcon = styled.span`
  position: absolute;
  left: 1rem;
  font-size: 1.8rem;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const InputField = styled.input`
  width: 100%;
  padding: 1rem 1rem 1rem ${({ $hasIcon }) => ($hasIcon ? '4rem' : '1rem')};
  border: 1px solid ${({ theme, $error }) => ($error ? theme.colors.danger : theme.colors.border)};
  border-radius: 16px;
  font-size: 1.4rem;
  color: ${({ theme }) => theme.colors.text};
  background-color: ${({ theme }) => theme.colors.cardBackground};
  transition: border-color 0.3s ease;

  &:focus {
    outline: none;
    border-color: ${({ theme, $error }) => ($error ? theme.colors.danger : theme.colors.primary)};
  }
`;

const ErrorText = styled.span`
  color: ${({ theme }) => theme.colors.danger};
  font-size: 1.2rem;
  margin-top: 0.2rem;
`;

export default function TextInput({ 
  name, 
  type = 'text', 
  label, 
  icon, 
  error,
  value,
  onChange,
  onBlur,
  ...props 
}) {
  return (
    <InputContainer>
      {label && <Label htmlFor={name}>{label}</Label>}
      <InputWrapper>
        {icon && <InputIcon>{icon}</InputIcon>}
        <InputField
          id={name}
          name={name}
          type={type}
          $hasIcon={!!icon}
          $error={!!error}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          {...props}
        />
      </InputWrapper>
      {error && <ErrorText>{error}</ErrorText>}
    </InputContainer>
  );
}