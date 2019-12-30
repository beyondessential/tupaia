/**
 * Tupaia Web
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */

/**
 * SingleComparisonWrapper
 *
 * Renders view with single comparison from data provided by viewContent object
 * @prop {object} viewContent An object with the following structure
   {
    "viewType": "singleComparison",
    "name": "Number of inpatient beds",
    "value": "0", // current value to compare against baseline value
    "baseline": "8"
  }
 * @return {React Component} a view with two values to compare and a title
 */

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { isMobile } from '../../utils';
import { BLUE, darkWhite } from '../../styles';

export class SingleComparisonWrapper extends PureComponent {
  render() {
    const { name, value, baseline } = this.props.viewContent;
    return (
      <div style={localStyles.row}>
        <div style={localStyles.labelText}>{name}</div>
        <div style={localStyles.comparison}>
          <div style={localStyles.baseline}>{`${baseline} (normal)`}</div>
          <div style={localStyles.current}>{`${value} (current)`}</div>
        </div>
      </div>
    );
  }
}

SingleComparisonWrapper.propTypes = {
  viewContent: PropTypes.object.isRequired,
};

const localStyles = {
  row: {
    display: 'flex',
    flexDirection: 'row',
    padding: '6px 0',
    width: '100%',
    maxWidth: isMobile() ? 400 : null,
    margin: isMobile() ? '0 auto' : null,
  },
  labelText: {
    fontSize: 16,
    textAlign: 'left',
    color: darkWhite,
    flexGrow: 1,
  },
  comparison: {
    display: 'flex',
    justifyContent: 'space-between',
    flexGrow: 2,
  },
  current: {
    fontSize: 16,
    textAlign: 'center',
    color: '#db2222',
  },
  baseline: {
    fontSize: 16,
    textAlign: 'center',
    color: BLUE,
  },
};
