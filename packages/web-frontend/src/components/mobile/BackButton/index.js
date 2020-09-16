/**
 * Tupaia Web
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import PropTypes from 'prop-types';
import BackIcon from 'material-ui/svg-icons/hardware/keyboard-arrow-left';
import { connect } from 'react-redux';

import { setOrgUnit } from '../../../actions';
import { DARK_BLUE, MOBILE_MARGIN_SIZE, WHITE } from '../../../styles';

const BackButton = ({ orgUnit, onSelectParent }) => (
  <div style={styles.wrapper}>
    <button type="button" onClick={() => onSelectParent(orgUnit)} style={styles.button}>
      <BackIcon style={styles.icon} color={DARK_BLUE} />
      Back
    </button>
  </div>
);

const styles = {
  wrapper: {
    padding: `0 ${MOBILE_MARGIN_SIZE}px`,
    backgroundColor: WHITE,
  },
  button: {
    border: 0,
    borderTop: '1px solid #EFEFF0',
    display: 'block',
    width: '100%',
    textAlign: 'left',
    padding: `${MOBILE_MARGIN_SIZE}px 0`,
    outline: 0,
    background: 'none',
    margin: 0,
    lineHeight: 1,
  },
  icon: {
    verticalAlign: 'middle',
    marginLeft: -8,
    marginTop: -2,
  },
};

BackButton.propTypes = {
  orgUnit: PropTypes.object,
};

export default connect(null, dispatch => ({
  onSelectParent: orgUnit => dispatch(setOrgUnit(orgUnit.parent)),
}))(BackButton);
