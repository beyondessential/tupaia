import React from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import ROUTES, { RenderRoutes } from './routes';

const App = () => {
  return (
    <Router>
      <div>
        <Header />
        <RenderRoutes routes={ROUTES} />
        <Footer />
      </div>
    </Router>
  );
};

export default App;
