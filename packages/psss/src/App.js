import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';

import { NavBar, Footer } from './components';
import { PageRoutes } from './routes/PageRoutes';

const App = () => {
  return (
    <Router>
      <NavBar />
      <PageRoutes />
      <Footer />
    </Router>
  );
};

export default App;
