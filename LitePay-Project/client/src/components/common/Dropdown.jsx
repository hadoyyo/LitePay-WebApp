import { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { FiMoreVertical } from 'react-icons/fi';

const DropdownContainer = styled.div`
  position: relative;
  display: inline-block;
`;

const DropdownMenu = styled.div`
  position: absolute;
  right: 0;
  top: 100%;
  background-color: ${({ theme }) => theme.colors.cardBackground};
  border-radius: 8px;
  box-shadow: ${({ theme }) => theme.shadows.lg};
  min-width: 200px;
  z-index: 100;
  overflow: hidden;
`;

const DropdownItem = styled.button`
  display: flex;
  align-items: center;
  gap: 0.8rem;
  width: 100%;
  padding: 1rem 1.5rem;
  background: none;
  border: none;
  text-align: left;
  color: ${({ theme, $color }) => $color ? theme.colors[$color] : theme.colors.text};
  cursor: pointer;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: ${({ theme }) => theme.colors.background};
  }
`;

export default function Dropdown({ trigger, items }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const toggleDropdown = () => setIsOpen(!isOpen);

  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <DropdownContainer ref={dropdownRef}>
      <div onClick={toggleDropdown}>
        {trigger || <FiMoreVertical />}
      </div>

      {isOpen && (
        <DropdownMenu>
          {items.map((item, index) => (
            <DropdownItem
              key={index}
              onClick={() => {
                item.onClick();
                setIsOpen(false);
              }}
              $color={item.color}
            >
              {item.icon}
              {item.label}
            </DropdownItem>
          ))}
        </DropdownMenu>
      )}
    </DropdownContainer>
  );
}