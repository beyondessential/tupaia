/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import { PhotoAlbum } from '@material-ui/icons';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { useParams } from 'react-router-dom';
import { TabsToolbar, CalendarToday } from '@tupaia/ui-components';
import { Header, HeaderAvatarTitle, WeeklyReportsExportModal } from '../components';
import { CountryRoutes } from '../routes/CountryRoutes';
import { countryFlagImage } from '../utils';
import { checkIsRegionalUser } from '../store';

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

export const CountryReportsViewComponent = ({ isRegionalUser }) => {
  const { countryName } = useParams();

  let back = null;

  if (isRegionalUser) {
    back = {
      url: '/',
      title: 'Countries',
    };
  }

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

CountryReportsViewComponent.propTypes = {
  isRegionalUser: PropTypes.bool.isRequired,
};

const mapStateToProps = state => ({
  isRegionalUser: checkIsRegionalUser(state),
});

export const CountryReportsView = connect(mapStateToProps)(CountryReportsViewComponent);
