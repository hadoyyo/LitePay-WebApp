import { useState } from 'react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import styled from 'styled-components';
import { useAuth } from '../../contexts/AuthContext';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import TextInput from '../../components/common/TextInput';
import ErrorMessage from '../../components/common/ErrorMessage';
import { FiUser, FiMail, FiCamera, FiLock } from 'react-icons/fi';

const ProfileContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;

  @media (min-width: 768px) {
    grid-template-columns: 1fr 2fr;
  }
`;

const Username = styled.h3`
  color: ${({ theme }) => theme.colors.text};
`;

const SectionTitle = styled.h2`
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: 1.5rem;
`;

const AvatarSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
`;

const Avatar = styled.div`
  width: 150px;
  height: 150px;
  border-radius: 50%;
  background-color: ${({ theme }) => theme.colors.primary}20;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  position: relative;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  svg {
    font-size: 5rem;
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const AvatarUpload = styled.label`
  display: inline-block;
  padding: 0.8rem 1.6rem;
  background-color: ${({ theme }) => theme.colors.primary};
  color: white;
  border-radius: 12px;
  cursor: pointer;
  font-size: 1.4rem;
  font-weight: 500;
  transition: opacity 0.3s ease;

  &:hover {
    opacity: 0.9;
  }

  input {
    display: none;
  }
`;

const ProfileForm = styled(Form)`
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


const PasswordSection = styled.div`
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
`;

const profileSchema = Yup.object().shape({
  firstName: Yup.string().required('Imię jest wymagane'),
  lastName: Yup.string().required('Nazwisko jest wymagane'),
  email: Yup.string()
    .email('Nieprawidłowy adres email')
    .required('Email jest wymagany')
});

const passwordSchema = Yup.object().shape({
  currentPassword: Yup.string()
    .required('Aktualne hasło jest wymagane'),
  newPassword: Yup.string()
    .min(6, 'Hasło musi mieć co najmniej 6 znaków')
    .required('Nowe hasło jest wymagane'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('newPassword'), null], 'Hasła muszą być identyczne')
    .required('Potwierdzenie hasła jest wymagane')
});

export default function ProfilePage() {
  const { user, updateUser, updatePhoto, updatePassword } = useAuth();
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [passwordError, setPasswordError] = useState(null);
  const [passwordSuccess, setPasswordSuccess] = useState(null);
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      await updatePhoto(file);
      setSuccess('Zdjęcie profilowe zostało zaktualizowane');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Wystąpił błąd podczas aktualizacji zdjęcia');
    }
  };

  const handleSubmit = async (values) => {
    try {
      await updateUser(values);
      setSuccess('Dane zostały zaktualizowane');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Wystąpił błąd podczas aktualizacji danych');
    }
  };

  const handlePasswordSubmit = async (values, { resetForm }) => {
    try {
      await updatePassword(values.currentPassword, values.newPassword);
      setPasswordSuccess('Hasło zostało zmienione');
      setPasswordError(null);
      resetForm();
      setShowPasswordForm(false);
      setTimeout(() => setPasswordSuccess(null), 3000);
    } catch (err) {
      setPasswordError(err.response?.data?.error || 'Wystąpił błąd podczas zmiany hasła');
    }
  };

  if (!user) {
    return <div></div>;
  }

  return (
    <ProfileContainer>
      <Card>
        <AvatarSection>
          <Avatar>
            <img
              src={`${process.env.REACT_APP_API_URL.replace('/api', '')}${user.profileImage || '/uploads/default.jpg'}?t=${Date.now()}`}
              alt="Profile"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = `${process.env.REACT_APP_API_URL.replace('/api', '')}/uploads/default.jpg`;
              }}
            />
          </Avatar>
          
          <AvatarUpload>
            <input 
              type="file" 
              accept="image/*" 
              onChange={handlePhotoChange} 
            />
            <FiCamera /> Zmień zdjęcie
          </AvatarUpload>
          
          <Username>{user.firstName} {user.lastName}</Username>
          <p>@{user.username}</p>
        </AvatarSection>
      </Card>

      <Card>
        <SectionTitle>Moje dane</SectionTitle>
        
        {error && <ErrorMessage message={error} />}
        {success && <div style={{ color: '#10b981' }}>{success}</div>}

        <Formik
          initialValues={{
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email
          }}
          validationSchema={profileSchema}
          onSubmit={handleSubmit}
        >
          {({ 
            isSubmitting, 
            errors, 
            touched, 
            values, 
            handleChange, 
            handleBlur 
          }) => (
            <ProfileForm>
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
                name="email"
                type="email"
                label="Email"
                icon={<FiMail />}
                error={touched.email && errors.email}
                value={values.email}
                onChange={handleChange}
                onBlur={handleBlur}
              />
              <div style={{ display: 'flex', justifyContent: 'center' }}>
              <Button 
                type="submit" 
                variant="primary" 
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Zapisywanie...' : 'Zapisz zmiany'}
              </Button>
              </div>
            </ProfileForm>
          )}
        </Formik>

        <PasswordSection>
          
          {passwordError && <ErrorMessage message={passwordError} />}
          {passwordSuccess && <div style={{ color: '#10b981' }}>{passwordSuccess}</div>}

          {!showPasswordForm ? (
            <Button 
              variant="outline" 
              onClick={() => setShowPasswordForm(true)}
            >
              Zmień hasło
            </Button>
          ) : (
            <Formik
              initialValues={{
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
              }}
              validationSchema={passwordSchema}
              onSubmit={handlePasswordSubmit}
            >
              {({ 
                isSubmitting, 
                errors, 
                touched, 
                values, 
                handleChange, 
                handleBlur 
              }) => (
                <ProfileForm>
                  <TextInput
                    name="currentPassword"
                    type="password"
                    label="Aktualne hasło"
                    icon={<FiLock />}
                    error={touched.currentPassword && errors.currentPassword}
                    value={values.currentPassword}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                  
                  <TextInput
                    name="newPassword"
                    type="password"
                    label="Nowe hasło"
                    icon={<FiLock />}
                    error={touched.newPassword && errors.newPassword}
                    value={values.newPassword}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                  
                  <TextInput
                    name="confirmPassword"
                    type="password"
                    label="Potwierdź nowe hasło"
                    icon={<FiLock />}
                    error={touched.confirmPassword && errors.confirmPassword}
                    value={values.confirmPassword}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                  
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <Button 
                      type="submit" 
                      variant="primary" 
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Zapisywanie...' : 'Zapisz nowe hasło'}
                    </Button>
                    <Button 
                      type="button" 
                      variant="danger" 
                      onClick={() => setShowPasswordForm(false)}
                    >
                      Anuluj
                    </Button>
                  </div>
                </ProfileForm>
              )}
            </Formik>
          )}
        </PasswordSection>
      </Card>
    </ProfileContainer>
  );
}