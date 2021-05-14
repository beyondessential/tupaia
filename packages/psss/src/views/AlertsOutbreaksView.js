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
import { getCountryName } from '../store';
import { countryFlagImage } from '../utils';
import { AlertsTabView } from './Tabs/AlertsTabView';

const makeLinks = countryCode => {
  const categoryLink = category => ['/alerts', category, countryCode].filter(x => x).join('/');

  return [
    {
      label: 'Alerts',
      exact: true,
      to: categoryLink('active'),
      icon: <WarningCloud />,
    },
    {
      label: 'Outbreaks',
      exact: true,
      to: categoryLink('outbreaks'),
      icon: <Virus />,
    },
    {
      label: 'Archive',
      exact: true,
      to: categoryLink('archive'),
      icon: <Archive />,
    },
  ];
};

export const AlertsOutbreaksView = React.memo(() => {
  const location = useLocation();
  const { countryCode } = useParams();
  const links = makeLinks(countryCode);
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
      <AlertsTabView />
    </>
  );
});
