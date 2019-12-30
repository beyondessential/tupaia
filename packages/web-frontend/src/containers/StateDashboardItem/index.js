/**
 * Tupaia Web
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */

/**
 * DisasterList
 *
 * Takes viewContent directly from config server rather than fetching via a dataBuilder
 * and renders a component that will fetch the data it needs from redux state.
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';

import DisasterList from './components/DisasterList';

export default class StateDashboardItem extends Component {
  render() {
    const { viewContent } = this.props;
    const components = {
      ActiveDisasters: DisasterList,
    };
    const Component = components[viewContent.componentName];

    return <Component viewContent={viewContent} />;
  }
}

StateDashboardItem.propTypes = {
  viewContent: PropTypes.shape({}),
};
