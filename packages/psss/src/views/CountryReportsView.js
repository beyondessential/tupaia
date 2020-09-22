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
import { Header, HeaderAvatarTitle } from '../components';
import { WeeklyReportsExportModal } from '../containers/Modals';
import { CountryRoutes } from '../routes/CountryRoutes';
import { countryFlagImage } from '../utils';
import { checkIsMultiCountryUser } from '../store';

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

export const CountryReportsViewComponent = ({ backButtonConfig }) => {
  const { countryCode } = useParams();
  return (
    <>
      <Header
        Title={<HeaderAvatarTitle title={countryCode} avatarUrl={countryFlagImage(countryCode)} />}
        back={backButtonConfig}
        ExportModal={WeeklyReportsExportModal}
      />
      <TabsToolbar links={links} />
      <CountryRoutes />
    </>
  );
};

CountryReportsViewComponent.propTypes = {
  backButtonConfig: PropTypes.object,
};

CountryReportsViewComponent.defaultProps = {
  backButtonConfig: null,
};

const mapStateToProps = state => ({
  backButtonConfig: checkIsMultiCountryUser(state)
    ? {
        url: '/',
        title: 'Countries',
      }
    : null,
});

export const CountryReportsView = connect(mapStateToProps)(CountryReportsViewComponent);
