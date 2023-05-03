/**
 * Tupaia Web
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import TopBarLogo from '../TopBarLogo';
import SearchBar from '../SearchBar';
import UserBar from '../UserBar';
import { TOP_BAR_HEIGHT } from '../../styles';

// Both min height and height must be specified due to bugs in Firefox flexbox
// that means that topbar height will be ignored even if using flex-basis.
const TopBarWrapper = styled.div`
  background-color: #282a35;
  min-height: ${TOP_BAR_HEIGHT}px;
  height: ${TOP_BAR_HEIGHT}px;
  display: flex;
  z-index: 1000;
  position: relative;
  padding: 0 10px;
  border-bottom: 1px solid rgba(151, 151, 151, 0.3);
`;

const TopBar = ({ logo, showSearchBar, userBar }) => (
  <TopBarWrapper>
    <TopBarLogo {...logo} />
    {showSearchBar && <SearchBar />}
    <UserBar />
  </TopBarWrapper>
);

TopBar.propTypes = {
  logo: PropTypes.shape({
    url: PropTypes.string.isRequired,
    onClick: PropTypes.func,
  }).isRequired,
  showSearchBar: PropTypes.bool,
  userBar: PropTypes.shape.isRequired,
};

TopBar.defaultProps = {
  showSearchBar: true,
};

export default TopBar;
