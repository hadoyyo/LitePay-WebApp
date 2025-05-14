import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FiDollarSign, FiUserPlus, FiUsers, FiClock, FiEdit2, FiTrash2, FiUser, FiUserX, FiLogOut, FiArrowUp, FiArrowDown} from 'react-icons/fi';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import TimelineEvent from '../../components/dashboard/TimelineEvent';
import ExpenseList from '../../components/expenses/ExpenseList';
import DebtSummary from '../../components/groups/DebtSummary';
import Modal from '../../components/common/Modal';
import InviteMembersModal from '../../components/groups/InviteMembersModal';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import TextInput from '../../components/common/TextInput';

const GroupContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
`;

const GroupHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;

  @media (min-width: 768px) {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
`;

const GroupTitle = styled.h1`
  display: flex;
  align-items: center;
  gap: 1rem;
  color: ${({ $color }) => $color};
  margin: 0;
`;

const GroupActions = styled.div`
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
`;

const SectionTitle = styled.h2`
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 1.8rem;
  margin-bottom: 1.5rem;
  color: ${({ theme }) => theme.colors.text};
`;

const TwoColumns = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;

  @media (min-width: 992px) {
    grid-template-columns: 1fr 1fr;
  }
`;

const EditForm = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const MembersList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const MemberItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  border-radius: 8px;
  background-color: ${({ theme }) => theme.colors.backgroundSecondary};
`;

const MemberInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const ColorInfo = styled.div`
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const MemberAvatar = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: ${({ theme }) => theme.colors.primary}20;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;

  svg {
    color: ${({ theme }) => theme.colors.primary};
    font-size: 1.4rem;
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const MemberDetails = styled.div`
  display: flex;
  flex-direction: column;
`;

const MemberName = styled.p`
  margin: 0;
  font-size: 1.6rem;
  color: ${({ theme }) => theme.colors.text};
`;

const groupSchema = Yup.object().shape({
  name: Yup.string().required('Nazwa grupy jest wymagana'),
  color: Yup.string().required('Kolor jest wymagany')
});

export default function GroupDetailsPage() {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [group, setGroup] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [timelineEvents, setTimelineEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState(null);
  const [isRemovingMember, setIsRemovingMember] = useState(false);
  const [showAllExpenses, setShowAllExpenses] = useState(false);
  const [showAllTimelineEvents, setShowAllTimelineEvents] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);

  useEffect(() => {
    const fetchGroupData = async () => {
      try {
        const token = localStorage.getItem('token');
        
        if (!token || !user) {
          throw new Error('Authentication required. Please log in again.');
        }

        const [groupRes, expensesRes, timelineRes] = await Promise.all([
          axios.get(`${process.env.REACT_APP_API_URL}/groups/${groupId}`, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }),
          axios.get(`${process.env.REACT_APP_API_URL}/groups/${groupId}/expenses`, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }),
          axios.get(`${process.env.REACT_APP_API_URL}/groups/${groupId}/timeline`, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          })
        ]);

        setGroup(groupRes.data.data);
        setExpenses(expensesRes.data.data);
        setTimelineEvents(timelineRes.data.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching group data:', err);
        setError(err.message || 'Failed to load group data');
        if (err.response?.status === 401 || err.message.includes('Authentication')) {
          navigate('/login');
        } else {
          navigate('/groups');
        }
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchGroupData();
    }
  }, [groupId, navigate, user]);

  const handleAddExpense = () => {
    navigate(`/groups/${groupId}/expenses/new`);
  };

  const handleInviteMembers = () => {
    navigate(`/groups/${groupId}/invite`);
  };

  const handleEditGroup = async (values) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${process.env.REACT_APP_API_URL}/groups/${groupId}`,
        values,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      const groupRes = await axios.get(
        `${process.env.REACT_APP_API_URL}/groups/${groupId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      setGroup(groupRes.data.data);
      setShowEditModal(false);
      
      const timelineRes = await axios.get(
        `${process.env.REACT_APP_API_URL}/groups/${groupId}/timeline`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      setTimelineEvents(timelineRes.data.data);
    } catch (err) {
      console.error('Error updating group:', err);
      setError(err.response?.data?.error || 'Failed to update group');
    }
  };

  const handleDeleteGroup = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(
        `${process.env.REACT_APP_API_URL}/groups/${groupId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      navigate('/groups', { replace: true });
    } catch (err) {
      console.error('Error deleting group:', err);
      setError(err.response?.data?.error || 'Failed to delete group');
    } finally {
      setShowDeleteModal(false);
    }
  };

  const handleLeaveGroup = async () => {
    try {
      const token = localStorage.getItem('token');
      
      await axios.delete(
        `${process.env.REACT_APP_API_URL}/groups/${groupId}/members/${user._id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      navigate('/groups', { replace: true });
    } catch (err) {
      console.error('Error leaving group:', err);
      setError(err.response?.data?.error || 'Failed to leave group');
    } finally {
      setShowLeaveModal(false);
    }
  };

  const handleRemoveMember = async () => {
    if (!memberToRemove) return;
    
    setIsRemovingMember(true);
    try {
      const token = localStorage.getItem('token');
      
      await axios.delete(
        `${process.env.REACT_APP_API_URL}/groups/${groupId}/members/${memberToRemove._id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      // Odświeżenie danych
      const [groupRes, expensesRes, timelineRes] = await Promise.all([
        axios.get(`${process.env.REACT_APP_API_URL}/groups/${groupId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }),
        axios.get(`${process.env.REACT_APP_API_URL}/groups/${groupId}/expenses`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }),
        axios.get(`${process.env.REACT_APP_API_URL}/groups/${groupId}/timeline`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
      ]);

      setGroup(groupRes.data.data);
      setExpenses(expensesRes.data.data);
      setTimelineEvents(timelineRes.data.data);
      
      setMemberToRemove(null);
    } catch (err) {
      console.error('Error removing member:', err);
      setError(err.response?.data?.error || 'Failed to remove member');
    } finally {
      setIsRemovingMember(false);
    }
  };

  if (loading || !group) {
    return <div></div>;
  }

  const isCreator = group.createdBy._id === user._id;
  const isMember = group.members.some(member => member._id === user._id);

  return (
    <GroupContainer>
      <GroupHeader>
        <GroupTitle $color={group.color}>
          <FiUsers /> {group.name}
        </GroupTitle>
        <GroupActions>
          {isCreator && (
            <>
              <Button 
                variant="danger" 
                icon={<FiTrash2 />}
                onClick={() => setShowDeleteModal(true)}
              >
                Usuń
              </Button>
              <Button 
                variant="primary" 
                icon={<FiEdit2 />}
                onClick={() => setShowEditModal(true)}
              >
                Edytuj
              </Button>
            </>
          )}
          <Button 
            variant="primary" 
            icon={<FiUserPlus />}
            onClick={() => setShowInviteModal(true)}
          >
            Zaproś
          </Button>
          <Button 
            variant="primary" 
            icon={<FiDollarSign />}
            onClick={handleAddExpense}
          >
            Nowy wydatek
          </Button>
          {isMember && !isCreator && (
            <Button 
              variant="danger" 
              icon={<FiLogOut />}
              onClick={() => setShowLeaveModal(true)}
            >
              Opuść grupę
            </Button>
          )}
        </GroupActions>
      </GroupHeader>

      <TwoColumns>
        <div>
          <Card>
            <SectionTitle>
              <FiDollarSign /> Podsumowanie
            </SectionTitle>
            <DebtSummary expenses={expenses} group={group} />
          </Card>

          <Card>
            <SectionTitle>
              <FiDollarSign /> Wydatki
            </SectionTitle>
            {expenses.length > 0 ? (
              <>
                <ExpenseList 
                  expenses={
                    showAllExpenses 
                      ? [...expenses].sort((a, b) => new Date(b.date) - new Date(a.date))
                      : [...expenses]
                          .sort((a, b) => new Date(b.date) - new Date(a.date))
                          .slice(0, 5)
                  } 
                  groupId={groupId} 
                  onDelete={(expenseId) => 
                    setExpenses(expenses.filter(e => e._id !== expenseId))
                  }
                />
                {expenses.length > 5 && (
                  <div style={{ display: 'flex', justifyContent: 'center'}}>
                  <Button 
                    variant="text" 
                    onClick={() => setShowAllExpenses(!showAllExpenses)}
                    icon={showAllExpenses ? <FiArrowUp /> : <FiArrowDown />}
                    style={{ 
                      color: '#3B82F6',
                      backgroundColor: 'transparent',
                      padding: '0.1rem 1rem'
                    }}
                  >
                    {showAllExpenses ? 'Pokaż mniej' : 'Pokaż wszystkie'}
                  </Button>
                  </div>
                )}
              </>
            ) : (
              <p style={{ textAlign: 'center', color: '#6b7280' }}>
                Brak wydatków
              </p>
            )}
          </Card>
        </div>

        <div>
          <Card>
            <SectionTitle>
              <FiUsers /> Członkowie
            </SectionTitle>
            <MembersList>
              {group.members.map(member => (
                <MemberItem key={member._id}>
                  <MemberInfo>
                    <MemberAvatar>
                      {member.profileImage ? (
                        <img 
                          src={
                            member.profileImage.startsWith('/uploads') 
                              ? `${process.env.REACT_APP_API_URL.replace('/api', '')}${member.profileImage}`
                              : `${process.env.REACT_APP_API_URL}/uploads/${member.profileImage}`
                          } 
                          alt={member.firstName}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = '';
                          }}
                        />
                      ) : (
                        <FiUser size={16} />
                      )}
                    </MemberAvatar>
                    <MemberDetails>
                      <MemberName>
                        {member.firstName} {member.lastName}
                        {group.createdBy._id === member._id && (
                          <span 
                            role="img" 
                            aria-label="Założyciel grupy"
                            title="Założyciel grupy"
                            style={{ 
                              marginLeft: "0.5rem", 
                              fontSize: "1.2em",
                              filter: "drop-shadow(0 0 2px rgba(255, 215, 0, 0.5))"
                            }}
                          >
                            👑
                          </span>
                        )}
                      </MemberName>
                    </MemberDetails>
                  </MemberInfo>
                  {isCreator && member._id !== user._id && (
                    <Button 
                      variant="danger" 
                      onClick={() => setMemberToRemove(member)}
                      title="Usuń z grupy"
                      icon={<FiUserX />}
                      style={{ padding: '1rem'}}
                    >
                      Usuń
                    </Button>
                  )}
                </MemberItem>
              ))}
            </MembersList>
          </Card>

          <Card>
            <SectionTitle>
              <FiClock /> Ostatnie aktywności
            </SectionTitle>
            {timelineEvents.length > 0 ? (
              <>
                {(showAllTimelineEvents ? timelineEvents : timelineEvents.slice(0, 5)).map((event, index, array) => (
                  <TimelineEvent 
                    key={event._id} 
                    event={event}
                    islast={index === array.length - 1}
                  />
                ))}
                {timelineEvents.length > 5 && (
                  <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem' }}>
                    <Button 
                      variant="text" 
                      onClick={() => setShowAllTimelineEvents(!showAllTimelineEvents)}
                      icon={showAllTimelineEvents ? <FiArrowUp /> : <FiArrowDown />}
                      style={{ 
                        color: '#3B82F6',
                        backgroundColor: 'transparent',
                        padding: '0.1rem 1rem',
                      }}
                    >
                      {showAllTimelineEvents ? 'Pokaż mniej' : 'Pokaż wszystkie'}
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <p style={{ textAlign: 'center', color: '#6b7280' }}>
                Brak ostatnich aktywności
              </p>
            )}
          </Card>
        </div>
      </TwoColumns>

      {/* Edit Group Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edytuj grupę"
      >
        <Formik
          initialValues={{
            name: group.name,
            color: group.color
          }}
          validationSchema={groupSchema}
          onSubmit={handleEditGroup}
        >
          {({ 
            isSubmitting, 
            errors, 
            touched, 
            values, 
            handleChange, 
            handleBlur,
            setFieldValue
          }) => (
            <Form>
              <EditForm>
                <TextInput
                  name="name"
                  label="Nazwa grupy"
                  placeholder="Nazwa grupy"
                  icon={<FiUsers style={{ 
                    position: 'absolute',
                    left: '0.2rem',
                    top: '50%',
                    transform: 'translateY(-50%)'
                  }} />}
                  value={values.name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.name && errors.name}
                />
                
                <ColorInfo>
                <div style={{ margin: '1.5rem 0' }}>
                  <label htmlFor="color">Kolor grupy</label>
                  <input
                    type="color"
                    id="color"
                    name="color"
                    value={values.color}
                    onChange={(e) => {
                      setFieldValue('color', e.target.value);
                    }}
                    style={{ marginLeft: '1rem' }}
                  />
                </div>
                </ColorInfo>

                <div style={{ display: 'flex', justifyContent: 'right' }}>
                <Button 
                  type="submit" 
                  variant="primary" 
                  disabled={isSubmitting}
                  style={{ marginTop: '2rem' }}
                >
                  {isSubmitting ? 'Zapisywanie...' : 'Zapisz zmiany'}
                </Button>
                </div>
              </EditForm>
            </Form>
          )}
        </Formik>
      </Modal>

      {/* Delete Group Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Usuń grupę"
      >
        <p>Czy na pewno chcesz usunąć grupę "{group.name}"? Tej akcji nie można cofnąć.</p>
        <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem', justifyContent: 'right' }}>
          <Button 
            variant="secondary" 
            onClick={() => setShowDeleteModal(false)}
          >
            Anuluj
          </Button>
          <Button 
            variant="danger" 
            onClick={handleDeleteGroup}
          >
            Usuń grupę
          </Button>
        </div>
      </Modal>

      {/* Leave Group Modal */}
      <Modal
        isOpen={showLeaveModal}
        onClose={() => setShowLeaveModal(false)}
        title="Opuść grupę"
      >
        <p>Czy na pewno chcesz opuścić grupę "{group.name}"?</p>
        <p>Ta operacja spowoduje usunięcie wszystkich Twoich wydatków w tej grupie (gdzie jesteś płatnikiem lub uczestnikiem).</p>
        
        <p style={{ color: 'var(--colors-danger)', fontWeight: 'bold' }}>
          Tej operacji nie można cofnąć!
        </p>
        
        <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
          <Button 
            variant="secondary" 
            onClick={() => setShowLeaveModal(false)}
          >
            Anuluj
          </Button>
          <Button 
            variant="danger" 
            onClick={handleLeaveGroup}
          >
            Tak, opuść grupę
          </Button>
        </div>
      </Modal>

      {/* Remove Member Modal */}
      <Modal
        isOpen={!!memberToRemove}
        onClose={() => setMemberToRemove(null)}
        title={`Usuwanie członka grupy`}
      >
        {memberToRemove && (
          <>
            <p>Czy na pewno chcesz usunąć {memberToRemove.firstName} {memberToRemove.lastName} z grupy?</p>
            <p>Ta operacja spowoduje usunięcie wszystkich wydatków gdzie użytkownik jest płatnikiem lub uczestnikiem.</p>
            
            <p style={{ color: 'var(--colors-danger)', fontWeight: 'bold' }}>
              Tej operacji nie można cofnąć!
            </p>
            
            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
              <Button 
                variant="secondary" 
                onClick={() => setMemberToRemove(null)}
                disabled={isRemovingMember}
              >
                Anuluj
              </Button>
              <Button 
                variant="danger" 
                onClick={handleRemoveMember}
                disabled={isRemovingMember}
                isLoading={isRemovingMember}
              >
                Usuń członka i powiązane wydatki
              </Button>
            </div>
          </>
        )}
      </Modal>

      <InviteMembersModal
        groupId={groupId}
        groupName={group.name}
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
      />

    </GroupContainer>
  );
}