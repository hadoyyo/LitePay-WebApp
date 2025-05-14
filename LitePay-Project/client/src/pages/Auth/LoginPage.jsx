import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import styled from 'styled-components';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../../components/common/Button';
import TextInput from '../../components/common/TextInput';
import ErrorMessage from '../../components/common/ErrorMessage';
import Card from '../../components/common/Card';
import { FiLock, FiUser, FiMoon, FiSun } from 'react-icons/fi';

const LoginContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 2rem;
  gap: 3rem;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const LeftSection = styled.div`
  max-width: 500px;
  text-align: center;
`;

const Logo = styled.div`
  font-size: 2.5rem;
  font-weight: bold;
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;

  img {
    height: 50px;
    width: auto;
  }
`;

const FeatureList = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 3.8rem;
  margin-top: 3rem;
`;

const FeatureTitle = styled.h3`
  margin-bottom: 0.5rem;
  color: ${({ theme }) => theme.colors.text};
`;

const FeatureDescription = styled.p`
  color: ${({ theme }) => theme.colors.textSecondary};
  text-align: center;
  font-size: 1.3rem;
`;

const FeatureIconBase = styled.div`
  width: 60px;
  height: 60px;
  margin-bottom: 1rem;
  margin-top: -50px;
  margin-left: auto;
  margin-right: auto;
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  filter: drop-shadow(0px 8px 6px rgba(0, 0, 0, 0.2));
`;

const FeatureIcon1 = styled(FeatureIconBase)`
  background-image: url('/images/coin.webp');
`;

const FeatureIcon2 = styled(FeatureIconBase)`
  background-image: url('/images/chart.png');
`;

const FeatureIcon3 = styled(FeatureIconBase)`
  background-image: url('/images/calculator.png');
`;

const FeatureIcon4 = styled(FeatureIconBase)`
  background-image: url('/images/wallet.png');
`;

const FeatureCard = styled.div`
  padding: 1.5rem;
  padding-top: 2.5rem;
  border-radius: 20px;
  background: ${({ theme }) => theme.colors.cardBackground};
  box-shadow: ${({ theme }) => theme.shadows.md};
  transition: transform 0.2s;
  position: relative;

  &:hover {
    transform: translateY(-5px);
  }
`;

const AuthCard = styled(Card)`
  width: 100%;
  max-width: 450px;
`;

const AuthTitle = styled.h1`
  text-align: center;
  margin-bottom: 2rem;
  color: ${({ theme }) => theme.colors.text};
`;

const AuthForm = styled(Form)`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const AuthFooter = styled.div`
  margin-top: 1rem;
  text-align: center;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const AuthLink = styled(Link)`
  color: ${({ theme }) => theme.colors.primary};
  text-decoration: none;
  font-weight: 500;

  &:hover {
    text-decoration: underline;
  }
`;

const ThemeToggle = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.text};
  font-size: 2rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  transition: transform 0.2s ease;

  &:hover {
    transform: scale(1.1);
  }
`;

const loginSchema = Yup.object().shape({
  username: Yup.string().required('Nazwa użytkownika jest wymagana'),
  password: Yup.string().required('Hasło jest wymagane')
});

export default function LoginPage({ toggleTheme, theme }) {
  const { login, error } = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (values) => {
    setSubmitting(true);
    try {
      await login(values.username, values.password);
      navigate('/');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <LoginContainer>
      <LeftSection>
        <Logo>
          <img 
            src={theme === 'light' ? '/images/logo.png' : '/images/logo-dark.png'} 
            alt="Logo aplikacji" 
          />
        </Logo>
        
        <h2>Prosty sposób na dzielenie wydatków</h2>
        <p>Śledź wspólne wydatki z przyjaciółmi, rodziną lub współlokatorami</p>
        
        <FeatureList>
          <FeatureCard> 
            <FeatureIcon1 />
            <FeatureTitle>Wydatki grupowe</FeatureTitle>
            <FeatureDescription>Twórz grupy i łatwo rozliczaj wspólne koszty</FeatureDescription>
          </FeatureCard>
          
          <FeatureCard>
            <FeatureIcon2 />
            <FeatureTitle>Statystyki i wykresy</FeatureTitle>
            <FeatureDescription>Analizuj swoje wydatki za pomocą przejrzystych wykresów</FeatureDescription>
          </FeatureCard>
          
          <FeatureCard>
            <FeatureIcon3 />
            <FeatureTitle>Proste rozliczenia</FeatureTitle>
            <FeatureDescription>System automatycznie oblicza kto komu jest dłużny</FeatureDescription>
          </FeatureCard>
          
          <FeatureCard>
            <FeatureIcon4 />
            <FeatureTitle>Pełna kontrola</FeatureTitle>
            <FeatureDescription>Przejrzystość wydatków domowych i na wyjeździe</FeatureDescription>
          </FeatureCard>
        </FeatureList>
      </LeftSection>
      
      <AuthCard>
        <ThemeToggle 
          onClick={toggleTheme}
          aria-label={theme === 'light' ? 'Przełącz na tryb ciemny' : 'Przełącz na tryb jasny'}
          style={{ position: 'absolute', top: '2.5rem', right: '2.5rem' }}
        >
          {theme === 'light' ? <FiSun /> : <FiMoon />}
        </ThemeToggle>
        <AuthTitle>Zaloguj się</AuthTitle>
        
        {error && <ErrorMessage message={error} />}

        <Formik
          initialValues={{ username: '', password: '' }}
          validationSchema={loginSchema}
          onSubmit={handleSubmit}
        >
          {({ values, errors, touched, handleChange, handleBlur, isSubmitting }) => (
            <AuthForm>
              <TextInput
                name="username"
                type="text"
                label="Nazwa użytkownika"
                icon={<FiUser />}
                error={touched.username && errors.username}
                value={values.username}
                onChange={handleChange}
                onBlur={handleBlur}
              />
              
              <TextInput
                name="password"
                type="password"
                label="Hasło"
                icon={<FiLock />}
                error={touched.password && errors.password}
                value={values.password}
                onChange={handleChange}
                onBlur={handleBlur}
              />
              
              <div style={{ display: 'flex', justifyContent: 'center' }}>
              <Button 
                type="submit" 
                variant="primary" 
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Logowanie...' : 'Zaloguj się'}
              </Button>
              </div>
            </AuthForm>
          )}
        </Formik>

        <AuthFooter>
          Nie masz konta? <AuthLink to="/register">Zarejestruj się</AuthLink>
        </AuthFooter>
      </AuthCard>
    </LoginContainer>
  );
}