/**
 * Tupaia Web
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import TupaiaHome from '../TupaiaHome';
import SearchBar from '../SearchBar';
import UserBar from '../UserBar';
import { TOP_BAR_HEIGHT } from '../../styles';

const styles = {
  topBar: {
    backgroundColor: '#282a35',
    // Both min height and height must be specified due to bugs in Firefox flexbox
    // that means that topbar height will be ignored even if using flex-basis.
    minHeight: TOP_BAR_HEIGHT,
    height: TOP_BAR_HEIGHT,
    display: 'flex',
    zIndex: 1000,
    position: 'relative',
    padding: '0 10px',
    borderBottom: '1px solid rgba(151, 151, 151, 0.3)',
  },
};

const TopBar = () => (
  <div style={styles.topBar}>
    <TupaiaHome />
    <SearchBar />
    <UserBar />
  </div>
);

export default TopBar;
