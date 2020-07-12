/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import { useLocation } from 'react-router-dom';
import { WarningCloud, TabsToolbar, Virus } from '@tupaia/ui-components';
import { Archive } from '@material-ui/icons';
import { Header, OutbreaksExportModal, AlertsExportModal } from '../components';
import { AlertsRoutes } from '../routes/AlertsRoutes';

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
  const ExportModal = location.pathname.includes('outbreak')
    ? OutbreaksExportModal
    : AlertsExportModal;
  return (
    <>
      <Header title="Alerts & Outbreaks" ExportModal={ExportModal} />
      <TabsToolbar links={links} />
      <AlertsRoutes />
    </>
  );
};
