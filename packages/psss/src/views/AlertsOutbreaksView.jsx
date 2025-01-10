import PropTypes from 'prop-types';
import React from 'react';
import { connect, useSelector } from 'react-redux';
import { useLocation, useRouteMatch } from 'react-router-dom';
import { WarningCloud, Virus } from '@tupaia/ui-components';
import { Archive } from '@material-ui/icons';
import { Header, HeaderTitle, HeaderTitleWithSubHeading, TabsToolbar } from '../components';
import { AlertsExportModal, OutbreaksExportModal } from '../containers/Modals';
import { AlertRoutes } from '../routes/AlertRoutes';
import { getCountryCodes, getCountryName } from '../store';
import { countryFlagImage } from '../utils';

const makeLinks = path => [
  {
    label: 'Alerts',
    exact: true,
    to: `${path}/active`,
    icon: <WarningCloud />,
  },
  {
    label: 'Outbreaks',
    exact: true,
    to: `${path}/outbreaks`,
    icon: <Virus />,
  },
  {
    label: 'Archive',
    exact: true,
    to: `${path}/archive`,
    icon: <Archive />,
  },
];

export const AlertsOutbreaksViewComponent = React.memo(({ countryCodes }) => {
  const location = useLocation();
  const match = useRouteMatch();

  const ExportModal = location.pathname.includes('outbreak')
    ? OutbreaksExportModal
    : AlertsExportModal;

  let Title = <HeaderTitle title="Alerts & Outbreaks" />;

  if (countryCodes.length === 1) {
    const [countryCode] = countryCodes;
    const countryName = useSelector(state => getCountryName(state, countryCode));

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
      <TabsToolbar links={makeLinks(match.path)} baseRoute={match.url} />
      <AlertRoutes />
    </>
  );
});

AlertsOutbreaksViewComponent.propTypes = {
  countryCodes: PropTypes.arrayOf(PropTypes.string).isRequired,
};

const mapStateToProps = state => ({
  countryCodes: getCountryCodes(state),
});

export const AlertsOutbreaksView = connect(mapStateToProps)(AlertsOutbreaksViewComponent);
