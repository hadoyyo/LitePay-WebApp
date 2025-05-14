import styled from 'styled-components';
import { FiAlertCircle } from 'react-icons/fi';

const ErrorContainer = styled.div`
  display: flex;
  align-items: center;
  padding: 1.5rem;
  margin: 1rem 0;
  background-color: ${({ theme }) => theme.colors.danger}20;
  border-left: 4px solid ${({ theme }) => theme.colors.danger};
  border-radius: 4px;
  color: ${({ theme }) => theme.colors.danger};
`;

const ErrorIcon = styled.span`
  margin-right: 1rem;
  font-size: 2rem;
`;

const ErrorText = styled.p`
  margin: 0;
`;

export default function ErrorMessage({ message }) {
  return (
    <ErrorContainer>
      <ErrorIcon>
        <FiAlertCircle />
      </ErrorIcon>
      <ErrorText>{message}</ErrorText>
    </ErrorContainer>
  );
}