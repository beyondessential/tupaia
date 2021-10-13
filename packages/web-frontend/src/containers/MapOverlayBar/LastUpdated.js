/**
 * Tupaia Web
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */

/**
 * MapOverlayBar
 *
 * Similar to LocationBar, provides measures in a grouped listing. Measures from redux state.
 * Updates redux state with action when a measure is selected. Map listens to this part of state
 * and renders appropriately.
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import moment from 'moment';

import { VIEW_STYLES } from '../../styles';

class LastUpdated extends Component {
  getFormattedDate = () => {
    const { latestAvailable } = this.props;
    return `Latest overlay data: ${moment(latestAvailable).format('DD/MM/YYYY')}`;
  };

  shouldRender = () => !!this.props.latestAvailable;

  render() {
    return this.shouldRender() ? (
      <div style={VIEW_STYLES.overlayPeriodRange}>{this.getFormattedDate()}</div>
    ) : null;
  }
}

LastUpdated.propTypes = {
  latestAvailable: PropTypes.string,
};

LastUpdated.defaultProps = {
  latestAvailable: null,
};

const mapStateToProps = state => {
  const { measureInfo = {} } = state.map;

  const latestAvailable = measureInfo.period && measureInfo.period.latestAvailable;
  return { latestAvailable };
};

export default connect(mapStateToProps)(LastUpdated);
