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
  margin-top: 0.5rem;
  color: ${({ theme, $valid }) => $valid ? theme.colors.success : theme.colors.error};
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const DangerText = styled.p`
  text-align: center;
  color: ${({ theme }) => theme.colors.danger};
  margin: 1rem 0;
`;

const FormDebugger = () => {
  const { errors, touched } = useFormikContext();
  
  useEffect(() => {
    console.log('Form errors:', errors);
    console.log('Touched fields:', touched);
  }, [errors, touched]);

  return null;
};

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
        .min(0.01, 'Kwota musi być większa niż 0')
    })
  ).test(
    'total-amount',
    'Suma podziału musi być równa kwocie wydatku',
    function(shares) {
      const amount = this.parent.amount;
      if (!shares || !amount) return true;
      const total = shares.reduce((sum, share) => sum + share.amount, 0);
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
      setGroup(response.data.data);

      if (isEditing) {
        setSelectedMembers([]);
        setSplitMethod('equal');
      } else if (initialValues.shares) {
        const membersFromShares = initialValues.shares.map(share => 
          typeof share.user === 'object' ? share.user._id : share.user
        );
        setSelectedMembers(membersFromShares);
      }
    } catch (err) {
      console.error('Error fetching group:', err);
      setError('Nie udało się załadować danych grupy');
    } finally {
      setIsReady(true);
    }
  };

  fetchGroup();
}, [groupId, isEditing, initialValues.shares]);

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      const formattedValues = {
        ...values,
        amount: parseFloat(values.amount),
        shares: values.shares.map(share => ({
          user: share.user,
          amount: parseFloat(share.amount)
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

  if (method === 'equal') {
    // Równy podział
    const equalAmount = values.amount / (selectedMembers.length || group?.members.length || 1);
    const membersToUse = selectedMembers.length > 0 ? selectedMembers : group?.members.map(m => m._id) || [];
    
    const newShares = membersToUse.map(memberId => ({
      user: memberId,
      amount: parseFloat(equalAmount.toFixed(2))
    }));
    setFieldValue('shares', newShares);
  } else {
    // Nierówny podział
    const currentMembers = selectedMembers.length > 0 
      ? selectedMembers 
      : group?.members.map(m => m._id) || [];
    
    const existingShares = values.shares || [];
    const newShares = currentMembers.map(memberId => {
      const existingShare = existingShares.find(s => s.user === memberId);
      return {
        user: memberId,
        amount: existingShare ? existingShare.amount : parseFloat((values.amount / currentMembers.length).toFixed(2))
      };
    });
    
    setSelectedMembers(currentMembers);
    setFieldValue('shares', newShares);
  }
};

  const handleShareChange = (index, value, values, setFieldValue) => {
    const newAmount = parseFloat(value) || 0;
    const newShares = [...values.shares];
    newShares[index].amount = newAmount;
    setFieldValue('shares', newShares);
  };

const toggleMemberSelection = (memberId, values, setFieldValue) => {
  let newSelectedMembers;
  if (selectedMembers.includes(memberId)) {
    newSelectedMembers = selectedMembers.filter(id => id !== memberId);
  } else {
    newSelectedMembers = [...selectedMembers, memberId];
  }

  setSelectedMembers(newSelectedMembers);

  const currentShares = values.shares || [];
  let newShares;

  if (splitMethod === 'equal') {
    const equalAmount = values.amount / (newSelectedMembers.length || group?.members.length || 1);
    newShares = newSelectedMembers.map(id => ({
      user: id,
      amount: parseFloat(equalAmount.toFixed(2))
    }));
  } else {
    newShares = newSelectedMembers.map(id => {
      const existingShare = currentShares.find(s => s.user === id);
      return {
        user: id,
        amount: existingShare ? existingShare.amount : parseFloat((values.amount / newSelectedMembers.length).toFixed(2))
      };
    });
  }

  setFieldValue('shares', newShares);
};

  const calculateTotalShares = (shares) => {
    return shares?.reduce((total, share) => total + share.amount, 0) || 0;
  };

const getInitialValues = () => ({
  title: initialValues.title || '',
  amount: initialValues.amount || 0,
  date: initialValues.date ? new Date(initialValues.date) : new Date(),
  category: initialValues.category || 'food',
  paidBy: initialValues.paidBy?._id || initialValues.paidBy || (group?.members[0]?._id || ''),
  splitType: isEditing ? 'equal' : initialValues.splitType || 'equal',
  shares: initialValues.shares || [],
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
        isSubmitting,
        handleChange,
        handleBlur,
        setFieldValue
      }) => (
        <StyledForm>
          <FormContainer>
            <FormDebugger />
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
                  if (splitMethod === 'equal' && selectedMembers.length > 0) {
                    const equalAmount = newAmount / selectedMembers.length;
                    const newShares = selectedMembers.map(memberId => ({
                      user: memberId,
                      amount: parseFloat(equalAmount.toFixed(2))
                    }));
                    setFieldValue('shares', newShares);
                  }
                }}
                value={values.amount}
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
              {/* Pole z datą */}
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

              {/* Pole "Zapłacono przez" */}
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
                
                {values.amount > 0 ? (
                  <>
                    <div style={{ marginBottom: '1.5rem' }}>
                      <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>Zapłacono za:</p>
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
                    
                    {selectedMembers.length === 0 && isEditing ? (
                      <p style={{ textAlign: 'center', color: '#6b7280', margin: '1rem 0' }}>
                        Wybierz za kogo zapłacono, aby podzielić koszty
                      </p>
                    ) : selectedMembers.length > 0 ? (
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
                              <SplitTableHeader>Kwota</SplitTableHeader>
                            </tr>
                          </thead>
                          <tbody>
                            {values.shares?.map((share, index) => (
                              <tr key={`${share.user}-${index}`}>
                                <SplitTableCell>
                                  {group.members.find(m => m._id === share.user)?.firstName}{' '}
                                  {group.members.find(m => m._id === share.user)?.lastName}
                                </SplitTableCell>
                                <SplitTableCell>
                                  <TextInput
                                    type="number"
                                    value={share.amount.toFixed(2)}
                                    step="0.01"
                                    onChange={(e) => handleShareChange(index, e.target.value, values, setFieldValue)}
                                    disabled={splitMethod === 'equal'}
                                  />
                                </SplitTableCell>
                              </tr>
                            ))}
                          </tbody>
                        </SplitTable>

                        <ValidationMessage $valid={Math.abs(calculateTotalShares(values.shares) - values.amount) < 0.01}>
                          {Math.abs(calculateTotalShares(values.shares) - values.amount) < 0.01 ? (
                            <>
                              <FiCheck /> Suma podziału zgadza się z kwotą wydatku
                            </>
                          ) : (
                            <>
                              <FiX /> Suma podziału: {calculateTotalShares(values.shares).toFixed(2)} zł (różnica: {(calculateTotalShares(values.shares) - values.amount).toFixed(2)} zł)
                            </>
                          )}
                        </ValidationMessage>
                      </>
                    ) : (
                      <DangerText>
                        Wybierz za kogo zapłacono, aby podzielić koszty
                      </DangerText>
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