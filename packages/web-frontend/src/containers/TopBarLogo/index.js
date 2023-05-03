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
import PropTypes from 'prop-types';

const LogoWrapper = styled.div`
  flex-grow: 1;
  height: 100%;
  box-sizing: border-box;
`;

const LogoImage = styled.img`
  max-height: 100%;
  width: auto;
`;

const LogoButton = styled.button`
  cursor: pointer;
  pointer-events: auto;
  padding: 0.75em;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background: none;
  border: none;
`;

const LogoContainer = ({ onClick, children }) =>
  onClick ? <LogoButton onClick={onClick}>{children}</LogoButton> : <div>{children}</div>;

export const TopBarLogoComponent = ({ onClick, url }) => {
  return (
    <LogoWrapper>
      <LogoContainer onClick={onClick}>
        <LogoImage src={url} alt="Logo" />
      </LogoContainer>
    </LogoWrapper>
  );
};

TopBarLogoComponent.propTypes = {
  onClick: PropTypes.func.isRequired,
  url: PropTypes.string.isRequired,
};

export default TopBarLogoComponent;
