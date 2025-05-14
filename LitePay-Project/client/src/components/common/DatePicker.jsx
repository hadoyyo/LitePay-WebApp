import { useState } from 'react';
import styled from 'styled-components';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { FiCalendar } from 'react-icons/fi';

const DatePickerContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-size: 1.4rem;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const PickerWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;

  .react-datepicker-wrapper {
    width: 100%;
  }

  .react-datepicker__input-container input {
    width: 100%;
    padding: 1rem 1rem 1rem 3rem;
    border: 1px solid ${({ theme, $error }) => 
      $error ? theme.colors.danger : theme.colors.border};
    border-radius: 16px;
    font-size: 1.4rem;
    color: ${({ theme }) => theme.colors.text};
    background-color: ${({ theme }) => theme.colors.cardBackground};

    &:focus {
      outline: none;
      border-color: ${({ theme, $error }) => 
        $error ? theme.colors.danger : theme.colors.primary};
    }
  }
`;

const IconWrapper = styled.span`
  position: absolute;
  left: 1rem;
  font-size: 1.8rem;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

export default function CustomDatePicker({ 
  selected, 
  onChange, 
  label, 
  icon = <FiCalendar />,
  error,
  ...props 
}) {
  const [startDate, setStartDate] = useState(selected || new Date());

  const handleChange = (date) => {
    setStartDate(date);
    onChange(date);
  };

  return (
    <DatePickerContainer>
      {label && <Label>{label}</Label>}
      <PickerWrapper $error={error}>
        <IconWrapper>{icon}</IconWrapper>
        <DatePicker
          selected={startDate}
          onChange={handleChange}
          dateFormat="dd/MM/yyyy"
          {...props}
        />
      </PickerWrapper>
    </DatePickerContainer>
  );
}