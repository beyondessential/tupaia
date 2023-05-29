/**
 * Tupaia Web
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */

/**
 * TupaiaHome
 *
 * Home button for the app, center top of map.
 */

import React from 'react';
import styled from 'styled-components';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Typography } from '@material-ui/core';
import { useCustomLandingPages } from '../../screens/LandingPage/useCustomLandingPages';
import { TUPAIA_LIGHT_LOGO_SRC } from '../../constants';
import { goHome } from '../../actions';

const LogoWrapper = styled.div`
  flex-grow: 1;
  height: 100%;
  box-sizing: border-box;
  display: flex;
  align-items: center;
`;

const LogoImage = styled.img`
  max-height: 40px; // 80% of top bar height
  width: auto;
  max-width: 50px;
  @media screen and (min-width: ${({ theme }) => theme.breakpoints.values.sm}px) {
    max-width: 100%;
    max-height: 48px; // 80% of top bar height
  }
`;

const LogoButton = styled.button`
  cursor: pointer;
  pointer-events: auto;
  padding: 0.5em;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background: none;
  border: none;
`;

const Name = styled(Typography)`
  font-style: normal;
  font-weight: ${props => props.theme.typography.fontWeightBold};
  font-size: 1rem;
  line-height: 1.4;
  letter-spacing: 0.1rem;
  @media screen and (min-width: ${({ theme }) => theme.breakpoints.values.sm}px) {
    font-size: 1.2rem;
  }
  @media screen and (min-width: ${({ theme }) => theme.breakpoints.values.md}px) {
    font-size: 1.5rem;
  }
`;

const NameWrapper = styled.div`
  max-width: 100%;
  ${LogoImage} + & {
    margin-left: 1.2rem;
  }
`;

// If logo is from a custom landing page, don't wrap in clickable button
const Logo = ({ isCustomLandingPage, children, onClick }) =>
  isCustomLandingPage ? children : <LogoButton onClick={onClick}>{children}</LogoButton>;

export const TopBarLogoComponent = ({ onClickLogo }) => {
  const { isCustomLandingPage, customLandingPageSettings = {} } = useCustomLandingPages();
  const {
    name,
    includeNameInHeader: displayName = false,
    logoUrl: customLandingPageLogo,
  } = customLandingPageSettings;

  // If is a custom landing page, use the logo from the settings, else use the Tupaia logo
  const logoSrc =
    isCustomLandingPage && customLandingPageLogo ? customLandingPageLogo : TUPAIA_LIGHT_LOGO_SRC;
  return (
    <LogoWrapper>
      <Logo onClick={onClickLogo} isCustomLandingPage={isCustomLandingPage}>
        <LogoImage src={logoSrc} alt="Logo" />
        {/** If a custom landing page has set to display the name in the header, display it here */}
        {displayName && (
          <NameWrapper>
            <Name variant="h1">{name}</Name>
          </NameWrapper>
        )}
      </Logo>
    </LogoWrapper>
  );
};

TopBarLogoComponent.propTypes = {
  onClickLogo: PropTypes.func.isRequired,
};

const mapDispatchToProps = dispatch => ({
  onClickLogo: () => dispatch(goHome()),
});

export default connect(null, mapDispatchToProps)(TopBarLogoComponent);
