import React, { useState, useEffect } from 'react';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('jwt_token');
    if (token) {
      setIsAuthenticated(true);
    }
    setIsInitializing(false);
  }, []);

  if (isInitializing) return null;

  return isAuthenticated ? (
    <DashboardPage onLogout={() => { 
      localStorage.removeItem('jwt_token'); 
      setIsAuthenticated(false); 
    }} />
  ) : (
    <LoginPage onLogin={() => setIsAuthenticated(true)} />
  );
}

export default App;
