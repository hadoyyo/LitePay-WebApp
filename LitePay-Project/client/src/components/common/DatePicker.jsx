import { useState, useRef, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { FiCalendar, FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const DAYS_PL = ['Pon', 'Wt', 'Śr', 'Czw', 'Pt', 'Sob', 'Ndz'];
const MONTHS_PL = [
  'Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec',
  'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień'
];

const DatePickerContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  position: relative;
`;

const Label = styled.label`
  font-size: 1.4rem;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const InputWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  cursor: pointer;
`;

const IconWrapper = styled.span`
  position: absolute;
  left: 1rem;
  font-size: 1.8rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  pointer-events: none;
  z-index: 1;
`;

const InputDisplay = styled.div`
  width: 100%;
  padding: 1rem 1rem 1rem 3rem;
  border: 1px solid ${({ theme, $error, $open }) =>
    $error ? theme.colors.danger : $open ? theme.colors.primary : theme.colors.border};
  border-radius: 16px;
  font-size: 1.4rem;
  color: ${({ theme }) => theme.colors.text};
  background-color: ${({ theme }) => theme.colors.cardBackground};
  user-select: none;
  transition: border-color 0.2s;
`;

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 999;
  background: rgba(0, 0, 0, 0.35);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 1.5rem;
  padding-top: max(1.5rem, calc(50vh - 23.5rem));
  padding-top: max(1.5rem, calc(50dvh - 23.5rem));
  overflow-y: auto;
  animation: fadeIn 0.15s ease-out;

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`;

const CalendarCard = styled.div`
  background: ${({ theme }) => theme.colors.cardBackground};
  border-radius: 20px;
  box-shadow: ${({ theme }) => theme.shadows.lg};
  padding: 2rem;
  width: min(400px, calc(100vw - 2rem));
  max-height: calc(100vh - 2rem);
  animation: scaleIn 0.2s ease-out;

  @keyframes scaleIn {
    from { transform: scale(0.95); opacity: 0; }
    to { transform: scale(1); opacity: 1; }
  }
`;

const CalendarHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
`;

const MonthYearLabel = styled.span`
  font-size: 1.6rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  user-select: none;
`;

const NavButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 3.6rem;
  height: 3.6rem;
  border: none;
  border-radius: 50%;
  background: transparent;
  color: ${({ theme }) => theme.colors.text};
  cursor: pointer;
  font-size: 2rem;
  transition: background-color 0.15s;

  &:hover {
    background: ${({ theme }) => theme.colors.border};
  }
`;

const DaysGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0.4rem;
`;

const DayLabel = styled.span`
  text-align: center;
  font-size: 1.2rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textSecondary};
  padding: 0.6rem 0;
  user-select: none;
`;

const DayCell = styled.button`
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 50%;
  font-size: 1.4rem;
  font-weight: ${({ $isSelected }) => ($isSelected ? '700' : '400')};
  cursor: ${({ $isEmpty }) => ($isEmpty ? 'default' : 'pointer')};
  transition: all 0.15s;
  user-select: none;

  background: ${({ theme, $isSelected, $isToday, $isEmpty }) => {
    if ($isEmpty) return 'transparent';
    if ($isSelected) return theme.colors.primary;
    if ($isToday) return theme.colors.primary + '18';
    return 'transparent';
  }};

  color: ${({ theme, $isSelected, $isToday, $isEmpty, $isOtherMonth }) => {
    if ($isEmpty) return 'transparent';
    if ($isSelected) return '#ffffff';
    if ($isOtherMonth) return theme.colors.textSecondary + '70';
    if ($isToday) return theme.colors.primary;
    return theme.colors.text;
  }};

  &:hover {
    background: ${({ theme, $isSelected, $isEmpty }) => {
      if ($isEmpty) return 'transparent';
      if ($isSelected) return theme.colors.primary;
      return theme.colors.border;
    }};
  }
`;

const TodayButton = styled.button`
  display: block;
  width: 100%;
  margin-top: 1.2rem;
  padding: 0.8rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 12px;
  background: transparent;
  color: ${({ theme }) => theme.colors.primary};
  font-size: 1.3rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.15s;

  &:hover {
    background: ${({ theme }) => theme.colors.primary + '10'};
  }
`;

function getCalendarDays(year, month) {
  const firstDay = new Date(year, month, 1);
  let startWeekday = firstDay.getDay() - 1;
  if (startWeekday < 0) startWeekday = 6;

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const cells = [];

  for (let i = startWeekday - 1; i >= 0; i--) {
    cells.push({ day: daysInPrevMonth - i, otherMonth: true });
  }

  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, otherMonth: false });
  }

  let d = 1;
  while (cells.length < 42) {
    cells.push({ day: d++, otherMonth: true });
  }

  const lastRow = cells.slice(35);
  if (lastRow.every((c) => c.otherMonth)) {
    cells.length = 35;
  }

  return cells;
}

function isSameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function formatDate(date) {
  const d = String(date.getDate()).padStart(2, '0');
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const y = date.getFullYear();
  return `${d}/${m}/${y}`;
}

export default function CustomDatePicker({
  selected,
  onChange,
  label,
  icon = <FiCalendar />,
  error,
  ...props
}) {
  const [currentDate, setCurrentDate] = useState(selected || new Date());
  const [viewYear, setViewYear] = useState((selected || new Date()).getFullYear());
  const [viewMonth, setViewMonth] = useState((selected || new Date()).getMonth());
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (selected) {
      setCurrentDate(selected);
    }
  }, [selected]);

  const today = new Date();
  const cells = getCalendarDays(viewYear, viewMonth);

  const prevMonth = useCallback(() => {
    setViewMonth((m) => {
      if (m === 0) {
        setViewYear((y) => y - 1);
        return 11;
      }
      return m - 1;
    });
  }, []);

  const nextMonth = useCallback(() => {
    setViewMonth((m) => {
      if (m === 11) {
        setViewYear((y) => y + 1);
        return 0;
      }
      return m + 1;
    });
  }, []);

  const selectDay = (day, otherMonth) => {
    let y = viewYear;
    let m = viewMonth;
    if (otherMonth) {
      if (day > 15) {
        m -= 1;
        if (m < 0) { m = 11; y -= 1; }
      } else {
        m += 1;
        if (m > 11) { m = 0; y += 1; }
      }
    }
    const newDate = new Date(y, m, day);
    setCurrentDate(newDate);
    onChange(newDate);
    setOpen(false);
  };

  const goToToday = () => {
    const now = new Date();
    setViewYear(now.getFullYear());
    setViewMonth(now.getMonth());
    setCurrentDate(now);
    onChange(now);
    setOpen(false);
  };

  const handleOpen = () => {
    setViewYear(currentDate.getFullYear());
    setViewMonth(currentDate.getMonth());
    setOpen(true);
  };

  return (
    <DatePickerContainer>
      {label && <Label>{label}</Label>}
      <InputWrapper onClick={handleOpen}>
        <IconWrapper>{icon}</IconWrapper>
        <InputDisplay $error={error} $open={open}>
          {formatDate(currentDate)}
        </InputDisplay>
      </InputWrapper>

      {open && (
        <Overlay onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}>
          <CalendarCard onClick={(e) => e.stopPropagation()}>
            <CalendarHeader>
              <NavButton type="button" onClick={prevMonth} aria-label="Poprzedni miesiąc">
                <FiChevronLeft />
              </NavButton>
              <MonthYearLabel>
                {MONTHS_PL[viewMonth]} {viewYear}
              </MonthYearLabel>
              <NavButton type="button" onClick={nextMonth} aria-label="Następny miesiąc">
                <FiChevronRight />
              </NavButton>
            </CalendarHeader>

            <DaysGrid>
              {DAYS_PL.map((d) => (
                <DayLabel key={d}>{d}</DayLabel>
              ))}

              {cells.map((cell, idx) => {
                const cellDate = cell.otherMonth
                  ? null
                  : new Date(viewYear, viewMonth, cell.day);
                const isSelected = cellDate ? isSameDay(cellDate, currentDate) : false;
                const isToday = cellDate ? isSameDay(cellDate, today) : false;

                return (
                  <DayCell
                    key={idx}
                    type="button"
                    $isSelected={isSelected}
                    $isToday={isToday}
                    $isOtherMonth={cell.otherMonth}
                    $isEmpty={false}
                    onClick={() => selectDay(cell.day, cell.otherMonth)}
                  >
                    {cell.day}
                  </DayCell>
                );
              })}
            </DaysGrid>

            <TodayButton type="button" onClick={goToToday}>
              Dzisiaj
            </TodayButton>
          </CalendarCard>
        </Overlay>
      )}
    </DatePickerContainer>
  );
}
