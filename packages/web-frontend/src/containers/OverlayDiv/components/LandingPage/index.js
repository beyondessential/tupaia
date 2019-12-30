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

import logo from '../../../../images/tupaia-logo-white.png';
import { OverlayContent } from './OverlayContent';

const Container = styled.div`
  display: grid;
  grid-auto-flow: row;
  grid-template-rows: auto 1fr auto;
`;

const Logo = styled.img`
  width: 200px;
  height: 85px;
`;

const TagLine = styled.p`
  margin: 10px 0 40px;
`;

const ExploreModeButton = styled(Button)`
  margin-bottom: 16px;
  width: 250px;
  height: 50px;
  border-radius: 3px;
  font-size: 13px;

  svg {
    margin-right: 10px;
  }
`;

export const LandingPage = ({ activateExploreMode, isUserLoggedIn }) => {
  return (
    <Container>
      <div>
        <Logo src={logo} alt="Tupaia logo" />
        <TagLine>Health resource and supply chain mapping for the Asia Pacific region</TagLine>
        <ExploreModeButton onClick={activateExploreMode} variant="outlined">
          <ExploreIcon /> I just want to explore!
        </ExploreModeButton>
      </div>
      <OverlayContent isUserLoggedIn={isUserLoggedIn} />
    </Container>
  );
};

LandingPage.propTypes = {
  activateExploreMode: PropTypes.func.isRequired,
  isUserLoggedIn: PropTypes.bool.isRequired,
};
