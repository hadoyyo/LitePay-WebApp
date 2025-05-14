import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { FiHome } from 'react-icons/fi';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 50vh;
  text-align: center;
  padding: 2rem;
`;

const Title = styled.h1`
  font-size: 3rem;
  margin-bottom: 1rem;
  color: ${({ theme }) => theme.colors.primary};
`;

const Text = styled.p`
  font-size: 1.5rem;
  margin-bottom: 2rem;
  color: ${({ theme }) => theme.colors.text};
`;

const HomeButton = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background-color: ${({ theme }) => theme.colors.primary};
  color: white;
  border-radius: 12px;
  text-decoration: none;
  font-weight: bold;
  transition: all 0.3s ease;

  &:hover {
    opacity: 0.9;
    transform: translateY(-1px);
`;

export default function NotFoundPage() {
  return (
    <Container>
      <Title>404 - Strona nie znaleziona</Title>
      <Text>Przepraszamy, strona której szukasz nie istnieje.</Text>
      <HomeButton to="/">
        <FiHome /> Powrót do strony głównej
      </HomeButton>
    </Container>
  );
}