/**
 * Tupaia Web
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */

/**
 * MultiValueWrapper
 *
 * Renders view with values and keys from data provided by viewContent object
 * @prop {object} viewContent An object with the following structure
   {
    "type": "view",
    "viewType": "multiValue",
    "valueType": "boolean",
    "name": "Service offered",
    "data": [{"name": "Vaccinations", "value": 0},
             {"name": "Delivering babies", "value": 1},
             ... ]
  }
 * @return {React Component} a view with a list of values/icon -> names
 */

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { VIEW_STYLES } from '../../styles';
import { formatDataValue } from '../../utils';
import { ViewTitle } from './Typography';

export class MultiValueWrapper extends PureComponent {
  render() {
    const { valueType, presentationOptions = {}, data, name } = this.props.viewContent;
    const { isTitleVisible = false } = presentationOptions;

    return (
      <div style={{ ...VIEW_STYLES.viewContainer }}>
        {isTitleVisible && <ViewTitle>{name}</ViewTitle>}
        {data.map((element, index) => (
          <div
            style={{
              ...VIEW_STYLES.row,
              ...(index === data.length - 1 ? VIEW_STYLES.lastRow : {}),
            }}
            key={index}
          >
            <div style={VIEW_STYLES.labelColumn}>
              <div style={VIEW_STYLES.text}>{element.name}</div>
            </div>
            <div style={{ ...VIEW_STYLES.text, ...VIEW_STYLES.textValue }}>
              {formatDataValue(element.value, valueType, {
                total: element.total,
                presentationOptions,
              })}
            </div>
          </div>
        ))}
      </div>
    );
  }
}

MultiValueWrapper.propTypes = {
  viewContent: PropTypes.object.isRequired,
};
