import styled from 'styled-components';

const CardContainer = styled.div`
  background-color: ${({ theme }) => theme.colors.cardBackground};
  border-radius: 24px;
  box-shadow: ${({ theme }) => theme.shadows.md};
  padding: ${({ $padding }) => $padding || '2rem'};
  margin-bottom: 2rem;
  transition: box-shadow 0.3s ease;

  &:hover {
    box-shadow: ${({ theme, $hover }) => ($hover ? theme.shadows.md : 'none')};
  }
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const CardTitle = styled.h3`
  margin: 0;
  font-size: 1.6rem;
  color: ${({ theme }) => theme.colors.text};
`;

const CardBody = styled.div`
  color: ${({ theme }) => theme.colors.textSecondary};
`;

export default function Card({ title, children, padding, hover, actions }) {
  return (
    <CardContainer $padding={padding} $hover={hover}>
      {title && (
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          {actions && <div>{actions}</div>}
        </CardHeader>
      )}
      <CardBody>{children}</CardBody>
    </CardContainer>
  );
}