import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import Avatar from '@material-ui/core/Avatar';
import {
  Dashboard,
  HomeButton,
  LightProfileButton,
  WarningCloud,
  NavBar,
} from '@tupaia/ui-components';
import { Footer } from './components/Footer';
import { RouterView, isActive } from './router';
import { ROUTES } from './routes';

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
      <NavBar HomeButton={Home} links={links} Profile={Profile} isActive={isActive} />
      <RouterView routes={ROUTES} />
      <Footer />
    </Router>
  );
};

export default App;
