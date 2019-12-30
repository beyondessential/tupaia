/**
 * Tupaia Web
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */

/**
 * MultiSingleValueWrapper
 *
 * Renders view with multiple single value type views
 * @prop {object} viewContent An object with the following structure
 * NOTE: each element will prioritise it's own provided valueType, then this components valueType.
   {
    "type": "view",
    "viewType": "multiSingleValue",
    "name": "Some name, doesn't show",
    "data":[
      {"value": "valueOne", "name": "nameOne", "viewType" : "singleDate"},
      {"value": "valueOne", "name": "nameOne"}
    ]
  }
 * @return {React Component} a view with multiple single values
 */

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { VIEW_STYLES, DASHBOARD_META_MARGIN } from '../../styles';
import { getViewWrapper } from './utils';
import { VIEW_CONTENT_SHAPE } from './propTypes';

export class MultiSingleValueWrapper extends PureComponent {
  render() {
    const { data, valueType: parentValueType } = this.props.viewContent;
    const valueElements = data.map((viewContent, index) => {
      const safeViewContent = {
        // Ensure viewContent has a viewType
        ...viewContent,
        valueType: viewContent.valueType || parentValueType,
        viewType: viewContent.viewType || 'singleValue',
      };
      const ViewWrapper = getViewWrapper(safeViewContent);
      return (
        <ViewWrapper
          viewContent={safeViewContent}
          key={viewContent.name}
          style={{
            fontSize: '20px',
            marginBottom: index < data.length - 1 ? DASHBOARD_META_MARGIN : 0,
          }}
        />
      );
    });
    return <div style={VIEW_STYLES.viewContainer}>{valueElements}</div>;
  }
}

MultiSingleValueWrapper.propTypes = {
  viewContent: PropTypes.shape(VIEW_CONTENT_SHAPE).isRequired,
};
