import styled from 'styled-components';

const ButtonBase = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: ${({ $size }) => 
    $size === 'sm' ? '0.6rem 1.2rem' : 
    $size === 'lg' ? '1rem 2rem' : '0.8rem 1.6rem'};
  border-radius: 12px;
  font-weight: 500;
  font-size: ${({ $size }) => 
    $size === 'sm' ? '1.2rem' : 
    $size === 'lg' ? '1.6rem' : '1.4rem'};
  cursor: pointer;
  transition: all 0.3s ease;
  border: ${({ $variant, theme }) => 
    $variant === 'outline' ? `1px solid ${theme.colors.primary}` : 'none'};
  background-color: ${({ $variant, theme }) => 
    $variant === 'primary' ? theme.colors.primary : 
    $variant === 'danger' ? theme.colors.danger : 
    $variant === 'outline' ? 'transparent' : theme.colors.secondary};
  color: ${({ $variant, theme }) => 
    $variant === 'outline' ? theme.colors.primary : '#fff'};

  &:hover {
    opacity: 0.9;
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  svg {
    margin-right: ${({ $iconOnly }) => ($iconOnly ? '0' : '0rem')};
  }
`;

export default function Button({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  icon, 
  iconOnly,
  ...props 
}) {
  return (
    <ButtonBase 
      $variant={variant} 
      $size={size} 
      $iconOnly={iconOnly}
      {...props}
    >
      {icon}
      {!iconOnly && children}
    </ButtonBase>
  );
}