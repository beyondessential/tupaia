/**
 * Tupaia Web
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */

/**
 * SingleTickWrapper
 *
 * Renders view with single tick (check for positive and close for negative)
 * @prop {object} viewContent An object with the following structure
   {
    "type": "view",
    "viewType": "singleTick",
    "name": "Fridge working?",
    "value": 0
  }
 * @return {React Component} a view with one value and its title
 */

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import CheckIcon from 'material-ui/svg-icons/navigation/check';
import CloseIcon from 'material-ui/svg-icons/navigation/close';
import { VIEW_STYLES } from '../../styles';
import { ViewTitle } from './Typography';

export class SingleTickWrapper extends PureComponent {
  render() {
    const { name, value } = this.props.viewContent;
    const tick = value === 0 ? <CheckIcon /> : <CloseIcon />;
    return (
      <div style={VIEW_STYLES.viewContainer}>
        <ViewTitle>{name}</ViewTitle>
        {tick}
      </div>
    );
  }
}

SingleTickWrapper.propTypes = {
  viewContent: PropTypes.object.isRequired,
};
