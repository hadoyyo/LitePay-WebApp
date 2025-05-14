import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import styled from 'styled-components';
import axios from 'axios';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import TextInput from '../../components/common/TextInput';
import ErrorMessage from '../../components/common/ErrorMessage';
import {FiUsers} from 'react-icons/fi';

const FormContainer = styled.div`
  max-width: 600px;
  margin: 0 auto;
`;

const SectionTitle = styled.h2`
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: 1.5rem;
`;

const groupSchema = Yup.object().shape({
  name: Yup.string().required('Nazwa grupy jest wymagana'),
  color: Yup.string().required('Kolor jest wymagany')
});

export default function CreateGroupPage() {
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/groups`,
        values,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      navigate(`/groups/${response.data.data._id}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Wystąpił błąd podczas tworzenia grupy');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <FormContainer>
      <Card>
        <SectionTitle>Nowa grupa</SectionTitle>
        
        {error && <ErrorMessage message={error} />}

        <Formik
          initialValues={{
            name: '',
            color: '#3b82f6'
          }}
          validationSchema={groupSchema}
          onSubmit={handleSubmit}
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
              <TextInput
                name="name"
                label="Nazwa grupy"
                placeholder="Nazwa grupy"
                icon={<FiUsers />}
                value={values.name}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.name && errors.name}
              />

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

              <div style={{ display: 'flex', justifyContent: 'right' }}>
              <Button 
                type="submit" 
                variant="primary" 
                disabled={isSubmitting}
                style={{ marginTop: '2rem' }}
              >
                {isSubmitting ? 'Tworzenie...' : 'Utwórz grupę'}
              </Button>
              </div>
            </Form>
          )}
        </Formik>
      </Card>
    </FormContainer>
  );
}