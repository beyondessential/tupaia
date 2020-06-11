/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import { PhotoAlbum } from '@material-ui/icons';
import { useParams } from 'react-router-dom';
import { TabsToolbar, CalendarToday } from '@tupaia/ui-components';
import { Header } from '../components';
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

export const CountryReportsView = () => {
  const { countryName } = useParams();
  const back = {
    url: '/',
    title: 'Countries',
  };
  return (
    <React.Fragment>
      <Header
        title={countryName}
        back={back}
        avatarUrl="https://hatscripts.github.io/circle-flags/flags/as.svg"
      />
      <TabsToolbar links={links} />
      <CountryRoutes />
    </React.Fragment>
  );
};
