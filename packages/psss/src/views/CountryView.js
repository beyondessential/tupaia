/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import { PhotoAlbum, CalendarToday } from '@material-ui/icons';
import PropTypes from 'prop-types';
import { useParams } from 'react-router-dom';
import { TabsToolbar } from '@tupaia/ui-components';
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
  const { countryId } = useParams();
  return (
    <React.Fragment>
      <Header title={countryId} />
      <TabsToolbar links={links} />
      <CountryRoutes match={match} />
    </React.Fragment>
  );
};

CountryView.propTypes = {
  match: PropTypes.any.isRequired,
};
