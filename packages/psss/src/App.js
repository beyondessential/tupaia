import React, { useState } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { NavBar, Footer } from './components';
import { PageRoutes } from './routes/PageRoutes';
import { LoginView } from './views/LoginView';

const App = () => {
  const [user, setUser] = useState(false);
  const [authAttempted, setAuthAttempted] = useState(true);

  const handleLogin = () => {
    setUser(true);
    setAuthAttempted(true);
  };

  if (!authAttempted) {
    return <div>Loading...</div>;
  }

  return user ? (
    <Router>
      <NavBar />
      <PageRoutes />
      <Footer /> :
      <PageRoutes />
    </Router>
  ) : (
    <LoginView handleLogin={handleLogin} />
  );
};

export default App;
