/**
 * Tupaia Web
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */

/**
 * SidePanel
 *
 * Visual flex expandable div to show Information on the bottom.
 * Switchs between showing Dashboard and TupaiaInfo.
 */

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import styled from 'styled-components';
import Dashboard from '../Dashboard';
import ExpandButton from '../ExpandButton';
import {
  TRANS_BLACK,
  DASHBOARD_TRANSITION_TIME,
  CONTROL_BAR_WIDTH,
  CONTROL_BAR_PADDING,
} from '../../styles';
import { changeSidePanelContractedWidth, changeSidePanelExpandedWidth } from '../../actions';

const MIN_DEFAULT_WIDTH = 350;
const MAX_DEFAULT_WIDTH = 500;
const DEFAULT_WIDTH_RATIO = 0.2;
const MAX_EXPANDED_WIDTH = 1000;

const Panel = styled.div`
  display: flex;
  align-items: stretch;
  max-width: ${MAX_EXPANDED_WIDTH}px;
  position: relative;
  overflow: visible;
  background-color: ${TRANS_BLACK};
  display: flex;
  flex-direction: column;
  align-content: stretch;
  align-items: stretch;
  pointer-events: auto;
  height: 100%;
  cursor: auto;
  transition: ${DASHBOARD_TRANSITION_TIME};
`;

export class SidePanel extends PureComponent {
  constructor(props) {
    super(props);

    this.updateDimensions = this.updateDimensions.bind(this);
  }

  componentWillMount() {
    window.addEventListener('resize', this.updateDimensions);
    this.updateDimensions();
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.updateDimensions);
  }

  updateDimensions() {
    const { onChangeDefaultWidth, onChangeExpandedWidth } = this.props;

    let dashboardDefaultWidth = window.innerWidth * DEFAULT_WIDTH_RATIO;
    dashboardDefaultWidth = Math.min(dashboardDefaultWidth, MAX_DEFAULT_WIDTH);
    dashboardDefaultWidth = Math.max(dashboardDefaultWidth, MIN_DEFAULT_WIDTH);

    let dashboardExpandedWidth = window.innerWidth - CONTROL_BAR_WIDTH - CONTROL_BAR_PADDING * 2;
    dashboardExpandedWidth = Math.min(dashboardExpandedWidth, MAX_EXPANDED_WIDTH);

    onChangeDefaultWidth(dashboardDefaultWidth);
    onChangeExpandedWidth(dashboardExpandedWidth);
  }

  render() {
    const { isSidePanelExpanded, contractedWidth, expandedWidth } = this.props;
    const width = isSidePanelExpanded ? expandedWidth : contractedWidth;

    return (
      <Panel
        expanded={isSidePanelExpanded}
        ref={panel => {
          this.panel = panel;
        }}
        style={{ width }}
      >
        <ExpandButton />
        <Dashboard />
      </Panel>
    );
  }
}

SidePanel.propTypes = {
  isSidePanelExpanded: PropTypes.bool,
  contractedWidth: PropTypes.number,
  expandedWidth: PropTypes.number,
};

const mapStateToProps = state => {
  const { isSidePanelExpanded } = state.global;
  const { contractedWidth, expandedWidth } = state.dashboard;
  return {
    isSidePanelExpanded,
    contractedWidth,
    expandedWidth,
  };
};

const mapDispatchToProps = dispatch => ({
  onChangeDefaultWidth: width => dispatch(changeSidePanelContractedWidth(width)),
  onChangeExpandedWidth: width => dispatch(changeSidePanelExpandedWidth(width)),
});

export default connect(mapStateToProps, mapDispatchToProps)(SidePanel);
