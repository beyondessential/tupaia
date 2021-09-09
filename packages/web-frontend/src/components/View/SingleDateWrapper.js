/**
 * Tupaia Web
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */

/**
 * SingleDateWrapper
 *
 * Renders view with single date from data provided by viewContent object
 * @prop {object} viewContent An object with the following structure
   {
    "type": "view",
    "viewType": "singleDate",
    "name": "Date last assessed",
    "value": "2017-06-27T00:00:00.000Z"
  }
 * @return {React Component} a view with one date and its title
 */

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { VIEW_STYLES } from '../../styles';
import { ViewTitle } from './Typography';

const formatDate = value => {
  const date = new Date(value);
  if (!value || isNaN(date.getTime())) return 'Not yet assessed';
  return date.toDateString();
};

export class SingleDateWrapper extends PureComponent {
  render() {
    const { name, value } = this.props.viewContent;
    return (
      <div style={VIEW_STYLES.viewContainer}>
        <ViewTitle>{name}</ViewTitle>
        <div style={VIEW_STYLES.date}>{formatDate(value)}</div>
      </div>
    );
  }
}

SingleDateWrapper.propTypes = {
  viewContent: PropTypes.object.isRequired,
};
