import styled from 'styled-components';
import { FiHelpCircle, FiMail, FiGithub } from 'react-icons/fi';
import Card from '../../components/common/Card';

const HelpContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
`;

const HelpSection = styled.div`
  margin-bottom: 1rem;
`;

const HelpTitle = styled.h2`
  display: flex;
  align-items: center;
  gap: 1rem;
  color: ${({ theme }) => theme.colors.primary};
`;

const Title = styled.h1`
  margin-bottom: 2rem;
  color: ${({ theme }) => theme.colors.text};
`;

const HelpContent = styled.div`
  line-height: 1.6;
  color: ${({ theme }) => theme.colors.textSecondary};
  
  ul, ol {
    padding-left: 1.5rem;
    margin: 1rem 0;
  }
  
  li {
    margin-bottom: 0.5rem;
  }
`;

const ContactMethod = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin: 1rem 0;
  padding: 1rem;
  background-color: ${({ theme }) => theme.colors.background};
  border-radius: 8px;
`;

export default function HelpPage() {
  return (
    <HelpContainer>
      <Card>
        <Title>Pomoc</Title>

        <HelpSection>
          <HelpTitle>
            <FiHelpCircle /> Jak korzystać z aplikacji?
          </HelpTitle>
          <HelpContent>
            <p>
              Aplikacja LitePay pomaga śledzić wspólne wydatki w grupach znajomych, 
              współpracowników lub rodziny. Oto podstawowe funkcje:
            </p>
            <ul>
              <li><strong>Grupy</strong> - tworzysz grupy i dodajesz do nich znajomych</li>
              <li><strong>Wydatki</strong> - dodajesz wydatki w grupach i określasz kto za co płacił</li>
              <li><strong>Podział kosztów</strong> - system automatycznie oblicza kto komu jest winien pieniądze</li>
              <li><strong>Statystyki</strong> - analizujesz swoje wydatki na wykresach</li>
            </ul>
          </HelpContent>
        </HelpSection>

        <HelpSection>
          <HelpTitle>Dodawanie wydatków</HelpTitle>
          <HelpContent>
            <p>
              Aby dodać nowy wydatek:
            </p>
            <ol>
              <li>Przejdź do wybranej grupy</li>
              <li>Kliknij przycisk "Nowy wydatek"</li>
              <li>Wypełnij formularz: tytuł, kwota, data, kategoria, kto zapłacił i za kogo</li>
              <li>Określ podział kosztów (domyślnie kwota dzieli się równo)</li>
              <li>Zapisz wydatek</li>
            </ol>
            <p>
              Po dodaniu wydatku, system automatycznie przeliczy wszystkie należności w grupie.
            </p>
          </HelpContent>
        </HelpSection>

        <HelpSection>
          <HelpTitle>Kontakt</HelpTitle>
          <HelpContent>
            <p>
              Jeśli potrzebujesz dodatkowej pomocy, skontaktuj się z nami:
            </p>
            
            <ContactMethod>
              <FiMail size={24} />
              <div>
                <strong>Email:</strong> pomoc@litepay.pl
              </div>
            </ContactMethod>
            <ContactMethod>
              <FiGithub size={24} />
              <div>
                <strong>GitHub:</strong>{' '}
                <a 
                  href="https://github.com/hadoyyo" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ color: 'inherit', textDecoration: 'underline' }}
                >
                  https://github.com/hadoyyo
                </a>
              </div>
            </ContactMethod>
            <div style={{ marginTop: '2.5rem' }}>
            <p style={{ textAlign: 'center' }}>Wykonał Hubert Jędruchniewicz</p>
            </div>
          </HelpContent>
        </HelpSection>
      </Card>
    </HelpContainer>
  );
}