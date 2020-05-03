/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import { PhotoAlbum } from '@material-ui/icons';
import PropTypes from 'prop-types';
import { useParams } from 'react-router-dom';
import { TabsToolbar, CalendarToday } from '@tupaia/ui-components';
import { Header } from '../components/Header';
import { CountryRoutes } from '../routes/CountryRoutes';

const links = [
  {
    label: 'Weekly Case Data',
    to: '',
    icon: <CalendarToday />,
  },
  {
    label: 'Event-based Data',
    to: '/event-based',
    icon: <PhotoAlbum />,
  },
];

export const CountryView = ({ match }) => {
  const { countryName } = useParams();
  const back = {
    url: '/',
    title: 'Countries',
  };
  return (
    <React.Fragment>
      <Header title={countryName} avatarUrl="https://via.placeholder.com/80" back={back} />
      <TabsToolbar links={links} />
      <CountryRoutes match={match} />
    </React.Fragment>
  );
};

CountryView.propTypes = {
  match: PropTypes.any.isRequired,
};
