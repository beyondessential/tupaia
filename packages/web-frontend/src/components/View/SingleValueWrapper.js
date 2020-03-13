/**
 * Tupaia Web
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */

/**
 * SingleValueWrapper
 *
 * Renders view with single value from data provided by viewContent object
 * @prop {object} viewContent An object with the following structure
   {
    "type": "view",
    "viewType": "singleValue",
    "name": "Total Stock On Hand",
    "value": 24063409.4
  }
 * @return {React Component} a view with one value and its title
 */

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { VIEW_STYLES } from '../../styles';
import { formatDataValue } from '../../utils';

export class SingleValueWrapper extends PureComponent {
  render() {
    const { name, valueType, value, total, value_metadata } = this.props.viewContent;
    const metadata = value_metadata || this.props.viewContent[`${name}_metadata`];
    const { style } = this.props;

    return (
      <div style={VIEW_STYLES.viewContainer}>
        <div style={VIEW_STYLES.title}>{name}</div>
        <div style={{ ...VIEW_STYLES.data, ...(style || {}) }}>
          {formatDataValue(value, valueType, { ...metadata, total })}
        </div>
      </div>
    );
  }
}

SingleValueWrapper.propTypes = {
  viewContent: PropTypes.object.isRequired,
};
