/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { renderMatches, useLocation } from 'react-router';
import { matchRoutes } from 'react-router-dom';
import { FullPageLoader } from '@tupaia/ui-components';
import { Main } from './views/Main';
import { CreateNew } from './views/CreateNew';
import { useUser } from './api/queries';
import { VizConfigProvider as StateProvider } from './context';
import { useVizBuilderBasePath } from './utils';
import { NavPanel } from './components';

const Wrapper = styled.main`
  display: flex;
  flex-direction: column;
  background: ${props => props.theme.palette.background.default};
  height: 100vh;
  overflow: hidden;
`;

const Container = styled.div`
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
`;

export const App = ({ Footer, homeLink, logo }) => {
  const { isLoading: isUserLoading } = useUser();

  const basePath = useVizBuilderBasePath();
  const location = useLocation();

  const matches = matchRoutes(
    [
      {
        path: `${basePath}/viz-builder/:dashboardItemOrMapOverlay/new`,
        exact: true,
        element: <CreateNew />,
      },
      {
        path: `${basePath}/viz-builder/:dashboardItemOrMapOverlay/:visualisationId`,
        element: <Main />,
      },
      // react router v6 does not support optional params, so we need to define two routes
      {
        path: `${basePath}/viz-builder/:dashboardItemOrMapOverlay`,
        element: <Main />,
      },
    ],
    location.pathname,
  );

  if (isUserLoading) {
    return <FullPageLoader />;
  }

  return (
    <StateProvider>
      <Wrapper>
        <NavPanel logo={logo} homeLink={homeLink} />

        <Container>
          {/** Workaround for handling issues with this nested app */}
          {renderMatches(matches)}
          {Footer && <Footer />}
        </Container>
      </Wrapper>
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
