/**
 * Tupaia Web
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import Button from '@material-ui/core/Button';
import ExploreIcon from '@material-ui/icons/ExploreOutlined';

import { LoginPage } from './LoginPage';
import { ProjectPage } from '../ProjectPage';
import { OVERLAY_PADDING } from '../../constants';
import { TUPAIA_LIGHT_LOGO_SRC } from '../../../../constants';

const Container = styled.div`
  display: grid;
  grid-auto-flow: row;
  grid-template-rows: auto 1fr auto;
  padding: ${OVERLAY_PADDING};
`;

const Logo = styled.img`
  width: 200px;
  height: 85px;
`;

const TagLine = styled.p`
  margin: 10px 0 40px;
`;

const ViewProjectsButton = styled(Button)`
  margin-bottom: 16px;
  width: 225px;
  height: 50px;
  border-radius: 3px;
  font-size: 13px;

  svg {
    margin-right: 10px;
  }
`;

export const LandingPage = ({ isUserLoggedIn, isViewingProjects }) => {
  const [isProjectsPageVisible, setIsProjectsPageVisible] = React.useState(isViewingProjects);
  const showProjects = React.useCallback(() => setIsProjectsPageVisible(true));
  const hideProjects = React.useCallback(() => setIsProjectsPageVisible(false));

  const isLoginPageVisible = !isUserLoggedIn && !isProjectsPageVisible;

  return (
    <Container>
      <div>
        <Logo src={TUPAIA_LIGHT_LOGO_SRC} alt="Tupaia logo" />
        <TagLine>
          Data aggregation, analysis, and visualisation for the most remote settings in the world
        </TagLine>
        {isLoginPageVisible && (
          <ViewProjectsButton onClick={showProjects} variant="outlined">
            <ExploreIcon /> View projects
          </ViewProjectsButton>
        )}
      </div>
      {isLoginPageVisible ? (
        <LoginPage isUserLoggedIn={isUserLoggedIn} />
      ) : (
        <ProjectPage openLoginDialog={hideProjects} isUserLoggedIn={isUserLoggedIn} />
      )}
    </Container>
  );
};

LandingPage.propTypes = {
  isUserLoggedIn: PropTypes.bool.isRequired,
  isViewingProjects: PropTypes.bool,
};

LandingPage.defaultProps = {
  isViewingProjects: false,
};
