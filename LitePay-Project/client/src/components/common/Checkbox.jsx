import styled from 'styled-components';

const CheckboxContainer = styled.div`
  display: inline-block;
  vertical-align: middle;
`;

const HiddenCheckbox = styled.input.attrs({ type: 'checkbox' })`
  border: 0;
  clip: rect(0 0 0 0);
  clippath: inset(50%);
  height: 1px;
  margin: -1px;
  overflow: hidden;
  padding: 0;
  position: absolute;
  white-space: nowrap;
  width: 1px;
`;

const StyledCheckbox = styled.div`
  display: inline-block;
  width: 20px;
  height: 20px;
  background: ${({ theme, checked }) => 
    checked ? theme.colors.primary : theme.colors.background};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 4px;
  transition: all 150ms;
  cursor: pointer;

  ${HiddenCheckbox}:focus + & {
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.primary + '40'};
  }

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
  }

  &::after {
    content: '';
    display: ${({ checked }) => (checked ? 'block' : 'none')};
    position: relative;
    left: 6px;
    top: 2px;
    width: 5px;
    height: 10px;
    border: solid white;
    border-width: 0 2px 2px 0;
    transform: rotate(45deg);
  }
`;

const Checkbox = ({ checked, onChange, disabled }) => (
  <CheckboxContainer>
    <HiddenCheckbox 
      checked={checked} 
      onChange={onChange}
      disabled={disabled}
    />
    <StyledCheckbox checked={checked} />
  </CheckboxContainer>
);

export default Checkbox;