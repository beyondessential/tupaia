import React from 'react';
import { PhotoAlbum } from '@material-ui/icons';
import { connect, useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import { useParams, useRouteMatch } from 'react-router-dom';
import { CalendarToday } from '@tupaia/ui-components';
import { Header, HeaderAvatarTitle, TabsToolbar } from '../components';
import { WeeklyReportsExportModal } from '../containers/Modals';
import { CountryRoutes } from '../routes/CountryRoutes';
import { countryFlagImage } from '../utils';
import { checkIsMultiCountryUser, getCountryName } from '../store';

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

const CountryReportsViewComponent = ({ backButtonConfig }) => {
  const { countryCode } = useParams();
  const countryName = useSelector(state => getCountryName(state, countryCode));
  const match = useRouteMatch();

  return (
    <>
      <Header
        Title={<HeaderAvatarTitle title={countryName} avatarUrl={countryFlagImage(countryCode)} />}
        back={backButtonConfig}
        ExportModal={WeeklyReportsExportModal}
      />
      <TabsToolbar links={links} maxWidth="xl" baseRoute={match.url} />
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
