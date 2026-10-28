import { useState, useEffect } from 'react';
import { ThemeProvider } from 'styled-components';
import { lightTheme, darkTheme } from './assets/styles/theme';
import GlobalStyles from './assets/styles/GlobalStyles';
import { AuthProvider } from './contexts/AuthContext';
import AppRoutes from './routes/AppRoutes';
import { InvitationsProvider } from './contexts/InvitationsContext';
import { useAuth } from './contexts/AuthContext';

function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
  const loading = useAuth();

  useEffect(() => {
    localStorage.setItem('theme', theme);
  }, [theme]);
  

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  if (loading) {
    return <div> </div>;
  }

 return (
    <ThemeProvider theme={theme === 'light' ? lightTheme : darkTheme}>
      <GlobalStyles />
      <AuthProvider>
        <InvitationsProvider>
          <AppRoutes toggleTheme={toggleTheme} theme={theme} />
        </InvitationsProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}


export default App;