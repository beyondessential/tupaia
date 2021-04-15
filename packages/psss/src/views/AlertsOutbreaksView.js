/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import { useSelector } from 'react-redux';
import { useLocation, useParams } from 'react-router-dom';
import { WarningCloud, TabsToolbar, Virus } from '@tupaia/ui-components';
import { Archive } from '@material-ui/icons';
import { Header, HeaderTitle, HeaderTitleWithSubHeading } from '../components';
import { AlertsExportModal, OutbreaksExportModal } from '../containers/Modals';
import { AlertsRoutes } from '../routes/AlertsRoutes';
import { getCountryName } from '../store';
import { countryFlagImage } from '../utils';

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

export const AlertsOutbreaksView = () => {
  const location = useLocation();
  const { countryCode } = useParams();
  const countryName = useSelector(state => getCountryName(state, countryCode));

  const ExportModal = location.pathname.includes('outbreak')
    ? OutbreaksExportModal
    : AlertsExportModal;

  let Title = <HeaderTitle title="Alerts & Outbreaks" />;

  if (countryCode) {
    Title = (
      <HeaderTitleWithSubHeading
        title="Alerts & Outbreaks"
        subHeading={countryName}
        avatarUrl={countryFlagImage(countryCode)}
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
