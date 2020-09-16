/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import { PhotoAlbum } from '@material-ui/icons';
import { useParams } from 'react-router-dom';
import { TabsToolbar, CalendarToday } from '@tupaia/ui-components';
import { Header, HeaderAvatarTitle } from '../components';
import { WeeklyReportsExportModal } from '../containers/Modals';
import { CountryRoutes } from '../routes/CountryRoutes';
import { countryFlagImage } from '../utils';

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
    <>
      <Header
        Title={<HeaderAvatarTitle title={countryName} avatarUrl={countryFlagImage('as')} />}
        back={back}
        ExportModal={WeeklyReportsExportModal}
      />
      <TabsToolbar links={links} />
      <CountryRoutes />
    </>
  );
};
