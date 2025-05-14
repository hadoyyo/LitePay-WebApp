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
import { FiUser, FiMail, FiLock, FiSun, FiMoon } from 'react-icons/fi';

const RegisterContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 2rem;
  flex-direction: column;
`;

const Logo = styled.div`
  font-size: 2.5rem;
  font-weight: bold;
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: 3rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;

  img {
    height: 50px;
    width: auto;
  }
`;

const AuthCard = styled(Card)`
  width: 100%;
  max-width: 500px;
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

const TwoColumns = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;

  @media (max-width: 576px) {
    grid-template-columns: 1fr;
  }
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

const registerSchema = Yup.object().shape({
  username: Yup.string()
    .required('Nazwa użytkownika jest wymagana')
    .min(3, 'Nazwa użytkownika musi mieć co najmniej 3 znaki'),
  firstName: Yup.string().required('Imię jest wymagane'),
  lastName: Yup.string().required('Nazwisko jest wymagane'),
  email: Yup.string()
    .email('Nieprawidłowy adres email')
    .required('Email jest wymagany'),
  password: Yup.string()
    .required('Hasło jest wymagane')
    .min(6, 'Hasło musi mieć co najmniej 6 znaków'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Hasła muszą być identyczne')
    .required('Potwierdzenie hasła jest wymagane')
});

export default function RegisterPage({ toggleTheme, theme }) {
  const { register, error } = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (values) => {
    setSubmitting(true);
    try {
      await register(values);
      navigate('/');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <RegisterContainer>
      <Logo>
        <img 
          src={theme === 'light' ? '/images/logo.png' : '/images/logo-dark.png'} 
          alt="Logo aplikacji" 
        />
      </Logo>
      
      <AuthCard>
        <AuthTitle>Zarejestruj się</AuthTitle>
        <ThemeToggle 
          onClick={toggleTheme}
          aria-label={theme === 'light' ? 'Przełącz na tryb ciemny' : 'Przełącz na tryb jasny'}
          style={{ position: 'absolute', top: '2.5rem', right: '2.5rem' }}
        >
          {theme === 'light' ? <FiSun /> : <FiMoon />}
        </ThemeToggle>
        
        {error && <ErrorMessage message={error} />}

        <Formik
          initialValues={{ 
            username: '', 
            firstName: '',
            lastName: '',
            email: '', 
            password: '', 
            confirmPassword: '' 
          }}
          validationSchema={registerSchema}
          onSubmit={handleSubmit}
        >
          {({ values, errors, touched, handleChange, handleBlur, isSubmitting }) => (
            <AuthForm>
              <TwoColumns>
                <TextInput
                  name="firstName"
                  type="text"
                  label="Imię"
                  icon={<FiUser />}
                  error={touched.firstName && errors.firstName}
                  value={values.firstName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                
                <TextInput
                  name="lastName"
                  type="text"
                  label="Nazwisko"
                  icon={<FiUser />}
                  error={touched.lastName && errors.lastName}
                  value={values.lastName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
              </TwoColumns>

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
                name="email"
                type="email"
                label="Email"
                icon={<FiMail />}
                error={touched.email && errors.email}
                value={values.email}
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
              
              <TextInput
                name="confirmPassword"
                type="password"
                label="Potwierdź hasło"
                icon={<FiLock />}
                error={touched.confirmPassword && errors.confirmPassword}
                value={values.confirmPassword}
                onChange={handleChange}
                onBlur={handleBlur}
              />
              
              <div style={{ display: 'flex', justifyContent: 'center' }}>
              <Button 
                type="submit" 
                variant="primary" 
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Rejestrowanie...' : 'Zarejestruj się'}
              </Button>
              </div>
            </AuthForm>
          )}
        </Formik>

        <AuthFooter>
          Masz już konto? <AuthLink to="/login">Zaloguj się</AuthLink>
        </AuthFooter>
      </AuthCard>
    </RegisterContainer>
  );
}