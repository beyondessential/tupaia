/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import styled from 'styled-components';
import Dashboard from './Dashboard';
import { ExpandButton } from './ExpandButton';
import { TRANS_BLACK, CONTROL_BAR_WIDTH, CONTROL_BAR_PADDING, MAP_CONTROLS_WIDTH } from '../styles';
import { changeSidePanelContractedWidth, changeSidePanelExpandedWidth } from '../actions';

const MIN_DEFAULT_WIDTH = 350;
const MAX_DEFAULT_WIDTH = 500;
const DEFAULT_WIDTH_RATIO = 0.2;
const MAX_EXPANDED_WIDTH = 1000;

const Panel = styled.div`
  display: flex;
  align-items: stretch;
  flex-direction: column;
  align-content: stretch;
  max-width: ${MAX_EXPANDED_WIDTH}px;
  position: relative;
  overflow: visible;
  background-color: ${TRANS_BLACK};
  pointer-events: auto;
  height: 100%;
  cursor: auto;
  transition: width 0.5s ease;
`;

const SidePanel = ({
  isSidePanelExpanded,
  contractedWidth,
  expandedWidth,
  onChangeDefaultWidth,
  onChangeExpandedWidth,
}) => {
  const updateDimensions = () => {
    let dashboardDefaultWidth = window.innerWidth * DEFAULT_WIDTH_RATIO;
    dashboardDefaultWidth = Math.min(dashboardDefaultWidth, MAX_DEFAULT_WIDTH);
    dashboardDefaultWidth = Math.max(dashboardDefaultWidth, MIN_DEFAULT_WIDTH);

    let dashboardExpandedWidth =
      window.innerWidth - CONTROL_BAR_WIDTH - MAP_CONTROLS_WIDTH - CONTROL_BAR_PADDING * 2;
    dashboardExpandedWidth = Math.min(dashboardExpandedWidth, MAX_EXPANDED_WIDTH);

    onChangeDefaultWidth(dashboardDefaultWidth);
    onChangeExpandedWidth(dashboardExpandedWidth);
  };

  React.useEffect(() => {
    window.addEventListener('resize', updateDimensions);
    updateDimensions();

    return () => {
      window.removeEventListener('resize', updateDimensions);
    };
  }, []);

  const width = isSidePanelExpanded ? expandedWidth : contractedWidth;

  return (
    <Panel expanded={isSidePanelExpanded} style={{ width }}>
      <ExpandButton />
      <Dashboard />
    </Panel>
  );
};

SidePanel.propTypes = {
  isSidePanelExpanded: PropTypes.bool,
  contractedWidth: PropTypes.number.isRequired,
  expandedWidth: PropTypes.number.isRequired,
  onChangeDefaultWidth: PropTypes.func.isRequired,
  onChangeExpandedWidth: PropTypes.func.isRequired,
};

SidePanel.defaultProps = {
  isSidePanelExpanded: true,
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
