/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import PropTypes from 'prop-types';
import { useLocation } from 'react-router-dom';
import { connect } from 'react-redux';
import { WarningCloud, TabsToolbar, Virus } from '@tupaia/ui-components';
import { Archive } from '@material-ui/icons';
import {
  Header,
  HeaderTitle,
  HeaderTitleWithSubHeading,
  OutbreaksExportModal,
  AlertsExportModal,
} from '../components';
import { AlertsRoutes } from '../routes/AlertsRoutes';
import { countryFlagImage } from '../utils';
import { checkIsRegionalUser } from '../store';

const links = [
  {
    label: 'Alerts',
    to: '',
    icon: <WarningCloud />,
  },
  {
    label: 'Outbreaks',
    to: '/outbreaks',
    icon: <Virus />,
  },
  {
    label: 'Archive',
    to: '/archive',
    icon: <Archive />,
  },
];

export const AlertsOutbreaksViewComponent = ({ isRegionalUser }) => {
  const location = useLocation();
  const ExportModal = location.pathname.includes('outbreak')
    ? OutbreaksExportModal
    : AlertsExportModal;

  let Title = <HeaderTitle title="Alerts & Outbreaks" />;

  if (!isRegionalUser) {
    Title = (
      <HeaderTitleWithSubHeading
        title="Alerts & Outbreaks"
        subHeading="American Samoa"
        avatarUrl={countryFlagImage('as')}
      />
    );
  }

  return (
    <>
      <Header Title={Title} ExportModal={ExportModal} />
      <TabsToolbar links={links} />
      <AlertsRoutes />
    </>
  );
};

AlertsOutbreaksViewComponent.propTypes = {
  isRegionalUser: PropTypes.bool.isRequired,
};

const mapStateToProps = state => ({
  isRegionalUser: checkIsRegionalUser(state),
});

export const AlertsOutbreaksView = connect(mapStateToProps)(AlertsOutbreaksViewComponent);
