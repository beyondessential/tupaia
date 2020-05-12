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
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { goHome, changeOrgUnit } from '../../actions';
import logo from '../../images/tupaia-logo-white.png';

const styles = {
  logo: {
    flexGrow: 1,
  },
  logoImage: {
    height: 36,
    width: 'auto',
    margin: 12,
    cursor: 'pointer',
    pointerEvents: 'auto',
  },
};

export const TupaiaHomeComponent = ({ goHome }) => {
  return (
    <div style={styles.logo}>
      <img src={logo} alt="Tupaia logo" style={styles.logoImage} onClick={goHome} />
    </div>
  );
};

TupaiaHomeComponent.propTypes = {
  goHome: PropTypes.func.isRequired,
};

const mapDispatchToProps = dispatch => ({
  goHome: () => {
    dispatch(goHome());
    dispatch(changeOrgUnit());
  },
});

export default connect(null, mapDispatchToProps)(TupaiaHomeComponent);
