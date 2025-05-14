import { useEffect, useState } from 'react';
import axios from 'axios';
import styled from 'styled-components';
import { useOutletContext } from 'react-router-dom';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import TimelineEvent from '../../components/dashboard/TimelineEvent';
import InvitationItem from '../../components/dashboard/InvitationItem';
import AnimatedFeatureCard from '../../components/common/AnimatedFeatureCard';
import { FiClock, FiMail, FiArrowUp, FiArrowDown } from 'react-icons/fi';

const HomeContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
`;

const SectionTitle = styled.h3`
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 1.8rem;
  margin-bottom: 1.5rem;
  color: ${({ theme }) => theme.colors.text};
`;

const EmptyMessage = styled.p`
  color: ${({ theme }) => theme.colors.textSecondary};
  text-align: center;
  padding: 2rem;
`;

const features = [
  {
    icon: '/images/dart.png',
    title: 'Oto twoja strona główna',
    description: 'Tu wyświetlają się ostatnie wydarzenia w grupach i zaproszenia do nowych grup',
    position: { 
      top: '-25px', 
      right: '-10px', 
      transform: 'translateX(-50%)' 
    }
  },
  {
    icon: '/images/note.png',
    title: 'Kieruj podziałem kosztów',
    description: 'Przy dzieleniu wydatku wybierz, czy chcesz podzielić go równo, czy według udziału',
    position: { 
      top: '-20px', 
      left: '-20px' 
    }
  },
  {
    icon: '/images/safe.png',
    title: 'Wolisz działać w pojedynkę?',
    description: 'Aplikacji możesz używać również do kontroli osobistych finansów',
    position: { 
      top: '150px', 
      left: '-20px' 
    }
  },
  {
    icon: '/images/document.png',
    title: 'Potrzebujesz pomocy?',
    description: 'Zajrzyj do zakładki "Pomoc" w menu, aby uzyskać więcej informacji',
    position: { 
      top: '135px', 
      right: '-10px', 
      transform: 'translateX(-50%)' 
    }
  },

  {
    icons: ['/images/rocket.png', '/images/planet.png'],
    title: 'Monitoruj oś czasu',
    description: 'Znajdziesz tam całą historię zmian ze wszystkich grup',
    positions: [
      { top: '138px', left: '-20px' },
      { top: '-25px', right: '-20px' }
    ],
    isDouble: true
  }
];

export default function HomePage() {
  const [timelineEvents, setTimelineEvents] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [invitationsLoading, setInvitationsLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [showAllTimelineEvents, setShowAllTimelineEvents] = useState(false);
  const { refreshInvitationsCount } = useOutletContext();
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        
        const timelineRes = await axios.get(`${process.env.REACT_APP_API_URL}/timeline`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setTimelineEvents(timelineRes.data.data);
        
        const invitationsRes = await axios.get(`${process.env.REACT_APP_API_URL}/invitations`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setInvitations(invitationsRes.data.data);
        
      } catch (err) {
        console.error('Error fetching data:', err.response?.data || err.message);
      } finally {
        setLoading(false);
        setInvitationsLoading(false);
      }
    };
  
    fetchData();
  }, []);

  const handleInvitationResponse = async (invitationId, accepted) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${process.env.REACT_APP_API_URL}/invitations/${invitationId}/respond`,
        { status: accepted ? 'accepted' : 'rejected' },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setInvitations(prev => prev.filter(inv => inv._id !== invitationId));
      
      await refreshInvitationsCount();
      
      if (accepted) {
        const timelineRes = await axios.get(`${process.env.REACT_APP_API_URL}/timeline`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setTimelineEvents(timelineRes.data.data);
      }
    } catch (err) {
      console.error('Error responding to invitation:', err);

      if (err.response?.status === 400 || err.response?.status === 404) {
        setInvitations(prev => prev.filter(inv => inv._id !== invitationId));
        await refreshInvitationsCount();
      }
    }
  };

  if (loading) {
    return <div></div>;
  }

  return (
    <HomeContainer>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
        <AnimatedFeatureCard features={features} interval={5000} />
      </div>
      {/* Invitations Section */}
      {!invitationsLoading && invitations.length > 0 && (
        <Card>
          <SectionTitle>
            <FiMail /> Zaproszenia do grup
          </SectionTitle>
          {invitations.map(invitation => (
            <InvitationItem
              key={invitation._id}
              invitation={invitation}
              onResponse={handleInvitationResponse}
            />
          ))}
        </Card>
      )}

      {/* Timeline Section */}
      <Card>
        <SectionTitle>
          <FiClock /> Oś czasu
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
              <div style={{ display: 'flex', justifyContent: 'center'}}>
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
          <EmptyMessage>Brak wpisów na osi czasu</EmptyMessage>
        )}
      </Card>
    </HomeContainer>
  );
}