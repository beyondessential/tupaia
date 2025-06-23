import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { Navigate, Route, Routes } from 'react-router-dom';
import { FullPageLoader } from '@tupaia/ui-components';
import { Main } from './views/Main';
import { CreateNew } from './views/CreateNew';
import { VizConfigProvider as StateProvider } from './context';
import { SimplePageLayout } from '../layout';
import { useUser } from '../api/queries';

const Container = styled.div`
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
`;

export const App = ({ Footer, homeLink, logo }) => {
  const { isLoading: isUserLoading } = useUser();

  if (isUserLoading) {
    return <FullPageLoader />;
  }

  return (
    <StateProvider>
      <SimplePageLayout logo={logo} homeLink={homeLink}>
        <Container>
          <Routes>
            <Route path="/:dashboardItemOrMapOverlay/new" exact element={<CreateNew />} />
            <Route path="/:dashboardItemOrMapOverlay/:visualisationId" element={<Main />} />
            <Route path="/:dashboardItemOrMapOverlay" element={<Main />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          {Footer && <Footer />}
        </Container>
      </SimplePageLayout>
    </StateProvider>
  );
};

App.propTypes = {
  Footer: PropTypes.elementType,
  homeLink: PropTypes.string,
  logo: PropTypes.shape({
    url: PropTypes.string.isRequired,
    alt: PropTypes.string.isRequired,
  }),
};

App.defaultProps = {
  Footer: null,
  homeLink: '/',
  logo: {
    url: '/admin-panel-logo-white.svg',
    alt: 'Tupaia Admin Panel Logo',
  },
};
