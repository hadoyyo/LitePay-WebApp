import { useState, useEffect } from 'react';
import { Formik, Form, useFormikContext } from 'formik';
import * as Yup from 'yup';
import styled from 'styled-components';
import { FiDollarSign, FiUser, FiCalendar, FiTag, FiCheck, FiX } from 'react-icons/fi';
import axios from 'axios';
import Button from '../common/Button';
import TextInput from '../common/TextInput';
import SelectInput from '../common/SelectInput';
import DatePicker from '../common/DatePicker';
import ErrorMessage from '../common/ErrorMessage';

const StyledForm = styled(Form)`
  width: 100%;
`;

const FormContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const TwoColumns = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;

  @media (max-width: 576px) {
    grid-template-columns: 1fr;
  }
`;

const SplitMethodContainer = styled.div`
  margin: 1.5rem 0;
  padding: 1.5rem;
  background-color: ${({ theme }) => theme.colors.background};
  border-radius: 24px;
`;

const SplitMethodTitle = styled.h4`
  margin-top: 0;
  margin-bottom: 1rem;
  color: ${({ theme }) => theme.colors.text};
`;

const SplitMethodOptions = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

const SplitMethodButton = styled.button`
  padding: 0.5rem 1rem;
  border: 1px solid ${({ theme, $active }) => 
    $active ? theme.colors.primary : theme.colors.border};
  border-radius: 4px;
  background-color: ${({ theme, $active }) => 
    $active ? theme.colors.primary + '20' : 'transparent'};
  color: ${({ theme, $active }) => 
    $active ? theme.colors.primary : theme.colors.textSecondary};
  cursor: pointer;
`;

const SplitTable = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const SplitTableHeader = styled.th`
  text-align: left;
  padding: 0.5rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  color: ${({ theme }) => theme.colors.text};
`;

const SplitTableCell = styled.td`
  padding: 0.5rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  color: ${({ theme }) => theme.colors.text};
  vertical-align: middle;
`;

const FormActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
`;

const MemberSelection = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
`;

const MemberTag = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: 1px solid ${({ theme, $selected }) => 
    $selected ? theme.colors.primary : theme.colors.border};
  border-radius: 20px;
  background-color: ${({ theme, $selected }) => 
    $selected ? theme.colors.primary + '20' : 'transparent'};
  color: ${({ theme }) => theme.colors.text};
  cursor: pointer;
`;

const ValidationMessage = styled.div`
  margin-top: 0.75rem;
  color: ${({ theme, $valid }) => $valid ? theme.colors.success : theme.colors.danger || '#ef4444'};
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.3rem;
  font-weight: 500;
`;

const DangerText = styled.p`
  text-align: center;
  color: ${({ theme }) => theme.colors.danger};
  margin: 1rem 0;
`;

const SplitStatusBadge = styled.span`
  font-size: 1.1rem;
  font-weight: 500;
  margin-left: 0.75rem;
  padding: 0.2rem 0.6rem;
  border-radius: 12px;
  background-color: ${({ $isManual, theme }) => 
    $isManual ? (theme.colors.primary + '25') : (theme.colors.border + '50')};
  color: ${({ $isManual, theme }) => 
    $isManual ? theme.colors.primary : theme.colors.textSecondary};
`;

const SubmitButton = ({ isEditing }) => {
  const { isSubmitting } = useFormikContext();
  
  return (
    <Button
      type="submit"
      variant="primary"
      disabled={isSubmitting}
    >
      {isSubmitting ? 'Zapisywanie...' : isEditing ? 'Zaktualizuj wydatek' : 'Dodaj wydatek'}
    </Button>
  );
};

const expenseSchema = Yup.object().shape({
  title: Yup.string().required('Tytuł jest wymagany'),
  amount: Yup.number()
    .transform((value, originalValue) => (String(originalValue).trim() === '' ? undefined : value))
    .required('Kwota jest wymagana')
    .min(0.01, 'Kwota musi być większa niż 0'),
  date: Yup.date().required('Data jest wymagana'),
  category: Yup.string().required('Kategoria jest wymagana'),
  paidBy: Yup.string().required('Wybierz kto zapłacił'),
  splitType: Yup.string().required('Wybierz metodę podziału'),
  shares: Yup.array().of(
    Yup.object().shape({
      user: Yup.string().required('Użytkownik jest wymagany'),
      amount: Yup.number()
        .required('Kwota jest wymagana')
        .min(0, 'Kwota nie może być ujemna')
    })
  ).test(
    'total-amount',
    'Suma podziału musi być równa kwocie wydatku',
    function(shares) {
      const amount = this.parent.amount;
      if (!shares || !amount) return true;
      const total = shares.reduce((sum, share) => sum + (parseFloat(share.amount) || 0), 0);
      return Math.abs(total - amount) < 0.01;
    }
  )
});

const categories = [
  { value: 'food', label: '🍕 Jedzenie' },
  { value: 'transport', label: '🚗 Transport' },
  { value: 'shopping', label: '🛍️ Zakupy' },
  { value: 'entertainment', label: '🎬 Rozrywka' },
  { value: 'bills', label: '📄 Rachunki' },
  { value: 'accommodation', label: '🛏️ Zakwaterowanie' },
  { value: 'other', label: '💵 Inne' }
];

const distributeAmountEqually = (totalAmount, count) => {
  if (count <= 0) return [];
  const safeTotal = Math.max(0, parseFloat(totalAmount) || 0);
  const totalCents = Math.round(safeTotal * 100);
  const baseCents = Math.floor(totalCents / count);
  let remainder = totalCents % count;

  const result = [];
  for (let i = 0; i < count; i++) {
    let cents = baseCents;
    if (remainder > 0) {
      cents += 1;
      remainder -= 1;
    }
    result.push(cents / 100);
  }
  return result;
};

const recalculateShares = (
  shares,
  manualUsersSet,
  totalAmount,
  activeUserId = null,
  activeUserNewAmount = null
) => {
  if (!shares || shares.length === 0) return [];

  const safeTotal = Math.max(0, parseFloat(totalAmount) || 0);

  const updatedShares = shares.map(share => {
    const sUserId = typeof share.user === 'object' ? share.user._id : share.user;
    if (activeUserId && sUserId === activeUserId && activeUserNewAmount !== null) {
      return { ...share, user: sUserId, amount: activeUserNewAmount };
    }
    return { ...share, user: sUserId, amount: parseFloat(share.amount) || 0 };
  });

  const manualShares = updatedShares.filter(s => manualUsersSet.has(s.user));
  const unmodifiedShares = updatedShares.filter(s => !manualUsersSet.has(s.user));

  const manualSum = manualShares.reduce((sum, s) => sum + s.amount, 0);
  const remainingTotal = Math.max(0, parseFloat((safeTotal - manualSum).toFixed(2)));

  if (unmodifiedShares.length > 0) {
    const distributed = distributeAmountEqually(remainingTotal, unmodifiedShares.length);
    unmodifiedShares.forEach((share, index) => {
      share.amount = distributed[index];
    });
  }

  return updatedShares;
};

function ShareAmountInput({ amount, disabled, onChange, onBlur }) {
  const [isFocused, setIsFocused] = useState(false);
  const [localText, setLocalText] = useState(() => (
    typeof amount === 'number' ? amount.toFixed(2) : '0.00'
  ));

  useEffect(() => {
    if (!isFocused) {
      const formatted = typeof amount === 'number' ? amount.toFixed(2) : '0.00';
      setLocalText(formatted);
    }
  }, [amount, isFocused]);

  const handleChange = (e) => {
    let val = e.target.value.replace(',', '.');
    if (val === '' || /^\d*\.?\d{0,2}$/.test(val)) {
      setLocalText(val);
      const parsed = parseFloat(val) || 0;
      onChange(parsed);
    }
  };

  const handleFocus = (e) => {
    setIsFocused(true);
    e.target.select();
  };

  const handleBlur = () => {
    setIsFocused(false);
    const parsed = parseFloat(localText) || 0;
    setLocalText(parsed.toFixed(2));
    if (onBlur) {
      onBlur(parsed);
    }
  };

  return (
    <div style={{ maxWidth: '140px' }}>
      <TextInput
        type="text"
        inputMode="decimal"
        value={localText}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        disabled={disabled}
        placeholder="0.00"
        style={{ textAlign: 'right' }}
      />
    </div>
  );
}

export default function ExpenseForm({ 
  initialValues = {}, 
  onSubmit, 
  onCancel,
  groupId,
  isEditing = false
}) {
  const [group, setGroup] = useState(null);
  const [splitMethod, setSplitMethod] = useState(initialValues.splitType || 'equal');
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [manualUsers, setManualUsers] = useState(new Set());
  const [error, setError] = useState(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const fetchGroup = async () => {
      if (!groupId) {
        setIsReady(true);
        return;
      }

      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/groups/${groupId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        const groupData = response.data.data;
        setGroup(groupData);

        if (initialValues.shares && initialValues.shares.length > 0) {
          const membersFromShares = initialValues.shares.map(share => 
            typeof share.user === 'object' ? share.user._id : share.user
          );
          setSelectedMembers(membersFromShares);
          if (initialValues.splitType) {
            setSplitMethod(initialValues.splitType);
            if (initialValues.splitType === 'unequal') {
              setManualUsers(new Set(membersFromShares));
            }
          }
        } else if (groupData?.members?.length > 0) {
          setSelectedMembers(groupData.members.map(m => m._id));
        }
      } catch (err) {
        console.error('Error fetching group:', err);
        setError('Nie udało się załadować danych grupy');
      } finally {
        setIsReady(true);
      }
    };

    fetchGroup();
  }, [groupId, isEditing, initialValues.shares, initialValues.splitType]);

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      const formattedValues = {
        ...values,
        amount: parseFloat(values.amount),
        shares: values.shares.map(share => ({
          user: typeof share.user === 'object' ? share.user._id : share.user,
          amount: parseFloat(Number(share.amount).toFixed(2))
        }))
      };
      
      await onSubmit(formattedValues);
    } catch (error) {
      console.error('Submission error:', error);
      setError(error.response?.data?.message || error.message || 'Wystąpił błąd podczas zapisywania');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSplitMethodChange = (method, values, setFieldValue) => {
    setSplitMethod(method);
    setFieldValue('splitType', method);

    const membersToUse = selectedMembers.length > 0 
      ? selectedMembers 
      : (group?.members.map(m => m._id) || []);

    if (selectedMembers.length === 0 && membersToUse.length > 0) {
      setSelectedMembers(membersToUse);
    }

    const totalAmount = parseFloat(values.amount) || 0;
    setManualUsers(new Set());

    const distributed = distributeAmountEqually(totalAmount, membersToUse.length);
    const newShares = membersToUse.map((memberId, idx) => ({
      user: memberId,
      amount: distributed[idx] || 0
    }));

    setFieldValue('shares', newShares);
  };

  const handleShareAmountChange = (userId, newAmount, values, setFieldValue) => {
    const nextManualUsers = new Set(manualUsers);
    nextManualUsers.add(userId);
    setManualUsers(nextManualUsers);

    const totalAmount = parseFloat(values.amount) || 0;
    const updatedShares = recalculateShares(
      values.shares,
      nextManualUsers,
      totalAmount,
      userId,
      newAmount
    );

    setFieldValue('shares', updatedShares);
  };

  const handleShareAmountBlur = (values, setFieldValue) => {
    const formattedShares = values.shares.map(s => ({
      ...s,
      amount: parseFloat(Number(s.amount).toFixed(2))
    }));
    setFieldValue('shares', formattedShares);
  };

  const toggleMemberSelection = (memberId, values, setFieldValue) => {
    let newSelectedMembers;
    if (selectedMembers.includes(memberId)) {
      newSelectedMembers = selectedMembers.filter(id => id !== memberId);
    } else {
      newSelectedMembers = [...selectedMembers, memberId];
    }

    setSelectedMembers(newSelectedMembers);

    const nextManualUsers = new Set(manualUsers);
    if (!newSelectedMembers.includes(memberId)) {
      nextManualUsers.delete(memberId);
    }
    setManualUsers(nextManualUsers);

    const totalAmount = parseFloat(values.amount) || 0;

    if (splitMethod === 'equal') {
      const distributed = distributeAmountEqually(totalAmount, newSelectedMembers.length);
      const newShares = newSelectedMembers.map((id, idx) => ({
        user: id,
        amount: distributed[idx] || 0
      }));
      setFieldValue('shares', newShares);
    } else {
      const currentShares = values.shares || [];
      const baseShares = newSelectedMembers.map(id => {
        const found = currentShares.find(s => s.user === id);
        return {
          user: id,
          amount: found ? found.amount : 0
        };
      });
      const updated = recalculateShares(baseShares, nextManualUsers, totalAmount);
      setFieldValue('shares', updated);
    }
  };

  const calculateTotalShares = (shares) => {
    return shares?.reduce((total, share) => total + (parseFloat(share.amount) || 0), 0) || 0;
  };

  const getInitialValues = () => ({
    title: initialValues.title || '',
    amount: isEditing ? (initialValues.amount ?? '') : '',
    date: initialValues.date ? new Date(initialValues.date) : new Date(),
    category: initialValues.category || 'food',
    paidBy: initialValues.paidBy?._id || initialValues.paidBy || (group?.members[0]?._id || ''),
    splitType: initialValues.splitType || 'equal',
    shares: initialValues.shares?.map(s => ({
      amount: parseFloat(s.amount) || 0,
      user: typeof s.user === 'object' && s.user !== null ? s.user._id : s.user
    })) || [],
    group: groupId
  });

  if (!isReady) {
    return <div> </div>;
  }

  return (
    <Formik
      initialValues={getInitialValues()}
      validationSchema={expenseSchema}
      onSubmit={handleSubmit}
      enableReinitialize={true}
    >
      {({ 
        values, 
        errors, 
        touched, 
        handleChange, 
        handleBlur, 
        setFieldValue 
      }) => (
        <StyledForm>
          <FormContainer>
            {error && <ErrorMessage message={error} />}

            <TextInput
              name="title"
              label="Tytuł"
              placeholder="Nazwa wydatku"
              icon={<FiDollarSign />}
              error={touched.title && errors.title}
              onBlur={handleBlur}
              onChange={handleChange}
              value={values.title}
            />

            <TwoColumns>
              <TextInput
                name="amount"
                type="number"
                label="Kwota"
                placeholder="0.00"
                step="0.01"
                icon={<FiDollarSign />}
                error={touched.amount && errors.amount}
                onBlur={handleBlur}
                onChange={(e) => {
                  handleChange(e);
                  const newAmount = parseFloat(e.target.value) || 0;
                  if (selectedMembers.length > 0) {
                    if (splitMethod === 'equal') {
                      const distributed = distributeAmountEqually(newAmount, selectedMembers.length);
                      const newShares = selectedMembers.map((memberId, idx) => ({
                        user: memberId,
                        amount: distributed[idx] || 0
                      }));
                      setFieldValue('shares', newShares);
                    } else {
                      const updatedShares = recalculateShares(values.shares, manualUsers, newAmount);
                      setFieldValue('shares', updatedShares);
                    }
                  }
                }}
                value={values.amount === 0 ? '' : (values.amount ?? '')}
              />

              <SelectInput
                name="category"
                label="Kategoria"
                options={categories}
                icon={<FiTag />}
                error={touched.category && errors.category}
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.category}
              />
            </TwoColumns>

            <TwoColumns>
              <div>
                <div style={{ position: 'relative' }}>
                  <FiCalendar style={{
                    position: 'absolute',
                    left: '10px',
                    top: '70%',
                    transform: 'translateY(-50%)',
                    zIndex: 1,
                    color: '#6b7280'
                  }} />
                  <DatePicker
                    selected={values.date}
                    label="Data"
                    onChange={(date) => setFieldValue('date', date)}
                    dateFormat="dd/MM/yyyy"
                    customInput={
                      <TextInput
                        style={{ paddingLeft: '35px' }}
                        value={values.date.toLocaleDateString()}
                        readOnly
                      />
                    }
                  />
                </div>
              </div>

              {group && (
                <SelectInput
                  name="paidBy"
                  label="Zapłacono przez"
                  options={group.members.map(member => ({
                    value: member._id,
                    label: `${member.firstName} ${member.lastName}`
                  }))}
                  icon={<FiUser />}
                  value={values.paidBy}
                  onChange={(e) => setFieldValue('paidBy', e.target.value)}
                />
              )}
            </TwoColumns>

            {group && (
              <SplitMethodContainer>
                <SplitMethodTitle>Podziel koszty</SplitMethodTitle>
                
                {parseFloat(values.amount) > 0 ? (
                  <>
                    <div style={{ marginBottom: '1.5rem' }}>
                      <p style={{ marginTop: 0, marginBottom: '0.5rem', fontWeight: 500 }}>
                        Zapłacono za:
                      </p>
                      <MemberSelection>
                        {group.members.map(member => (
                          <MemberTag
                            key={member._id}
                            type="button"
                            $selected={selectedMembers.includes(member._id)}
                            onClick={() => toggleMemberSelection(member._id, values, setFieldValue)}
                          >
                            {selectedMembers.includes(member._id) ? <FiCheck size={14} /> : <FiX size={14} />}
                            {member.firstName} {member.lastName}
                          </MemberTag>
                        ))}
                      </MemberSelection>
                    </div>
                    
                    {selectedMembers.length === 0 ? (
                      <DangerText>
                        Wybierz za kogo zapłacono, aby podzielić koszty
                      </DangerText>
                    ) : (
                      <>
                        <SplitMethodOptions>
                          <SplitMethodButton
                            type="button"
                            $active={splitMethod === 'equal'}
                            onClick={() => handleSplitMethodChange('equal', values, setFieldValue)}
                          >
                            Po równo
                          </SplitMethodButton>
                          <SplitMethodButton
                            type="button"
                            $active={splitMethod === 'unequal'}
                            onClick={() => handleSplitMethodChange('unequal', values, setFieldValue)}
                          >
                            Nierówno
                          </SplitMethodButton>
                        </SplitMethodOptions>

                        <SplitTable>
                          <thead>
                            <tr>
                              <SplitTableHeader>Użytkownik</SplitTableHeader>
                              <SplitTableHeader style={{ textAlign: 'right', width: '160px' }}>
                                Kwota (zł)
                              </SplitTableHeader>
                            </tr>
                          </thead>
                          <tbody>
                            {values.shares?.map((share, index) => {
                              const shareUserId = typeof share.user === 'object' && share.user !== null ? share.user._id : share.user;
                              const member = group?.members?.find(m => m._id === shareUserId) || (typeof share.user === 'object' ? share.user : null);
                              const isManual = manualUsers.has(typeof share.user === "object" && share.user !== null ? share.user._id : share.user);
                              return (
                                <tr key={`${typeof share.user === "object" && share.user !== null ? share.user._id : share.user}-${index}`}>
                                  <SplitTableCell>
                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                      <span>{member?.firstName} {member?.lastName}</span>
                                      {splitMethod === 'unequal' && (
                                        <SplitStatusBadge $isManual={isManual}>
                                          {isManual ? 'ręcznie' : 'auto'}
                                        </SplitStatusBadge>
                                      )}
                                    </div>
                                  </SplitTableCell>
                                  <SplitTableCell style={{ textAlign: 'right' }}>
                                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                      <ShareAmountInput
                                        amount={share.amount}
                                        disabled={splitMethod === 'equal'}
                                        onChange={(newAmt) => 
                                          handleShareAmountChange(typeof share.user === "object" && share.user !== null ? share.user._id : share.user, newAmt, values, setFieldValue)
                                        }
                                        onBlur={() => handleShareAmountBlur(values, setFieldValue)}
                                      />
                                    </div>
                                  </SplitTableCell>
                                </tr>
                              );
                            })}
                          </tbody>
                        </SplitTable>

                        <ValidationMessage 
                          $valid={Math.abs(calculateTotalShares(values.shares) - parseFloat(values.amount || 0)) < 0.01}
                        >
                          {Math.abs(calculateTotalShares(values.shares) - parseFloat(values.amount || 0)) < 0.01 ? (
                            <>
                              <FiCheck /> Suma podziału zgadza się z kwotą wydatku ({calculateTotalShares(values.shares).toFixed(2)} zł)
                            </>
                          ) : (
                            <>
                              <FiX /> Suma podziału: {calculateTotalShares(values.shares).toFixed(2)} zł 
                              (różnica: {(calculateTotalShares(values.shares) - parseFloat(values.amount || 0)).toFixed(2)} zł)
                            </>
                          )}
                        </ValidationMessage>
                      </>
                    )}
                  </>
                ) : (
                  <DangerText>
                    Dodaj kwotę wydatku, aby podzielić koszty
                  </DangerText>
                )}
              </SplitMethodContainer>
            )}

            <FormActions>
              <SubmitButton isEditing={isEditing} />
            </FormActions>
          </FormContainer>
        </StyledForm>
      )}
    </Formik>
  );
}
