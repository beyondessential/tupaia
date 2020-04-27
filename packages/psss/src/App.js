import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import Avatar from '@material-ui/core/Avatar';
import { Dashboard, HomeButton, LightProfileButton, WarningCloud } from '@tupaia/ui-components';
import { NavBar } from './components/NavBar';
import { Footer } from './components/Footer';
import { RouterView, ROUTES } from './router';

const links = [
  {
    label: 'Weekly Reports',
    to: '/',
    icon: <Dashboard />,
  },
  {
    label: 'Alerts & Outbreaks',
    to: '/alerts',
    icon: <WarningCloud />,
  },
];

const Home = () => <HomeButton source="/psss-logo-white.svg" />;

const Profile = () => <LightProfileButton startIcon={<Avatar>T</Avatar>}>Tom</LightProfileButton>;

const App = () => {
  return (
    <Router>
      <div>
        <NavBar HomeButton={Home} links={links} Profile={Profile} />
        <RouterView routes={ROUTES} />
        <Footer />
      </div>
    </Router>
  );
};

export default App;
