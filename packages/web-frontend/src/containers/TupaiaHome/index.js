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

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { goHome, changeOrgUnit } from '../../actions';
import logo from '../../images/tupaia-logo-white.png';
import { selectProject } from '../../projects/actions';
import { INITIAL_PROJECT_CODE } from '../../defaults';
import { getProjectByCode } from '../../projects/selectors';

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

export class TupaiaHome extends Component {
  render() {
    return (
      <div style={styles.logo}>
        <img
          src={logo}
          alt="Tupaia logo"
          style={styles.logoImage}
          onClick={() => this.props.goHome(this.props.exploreProject)}
        />
      </div>
    );
  }
}

TupaiaHome.propTypes = {
  goHome: PropTypes.func.isRequired,
};

const mapStateToProps = state => {
  const exploreProject = getProjectByCode(state, INITIAL_PROJECT_CODE);

  return {
    exploreProject,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    goHome: project => {
      dispatch(goHome());
      dispatch(selectProject(project));
      dispatch(changeOrgUnit());
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(TupaiaHome);
