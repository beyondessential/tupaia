/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import styled from 'styled-components';
import ArrowOpenIcon from 'material-ui/svg-icons/hardware/keyboard-arrow-left';
import ArrowCloseIcon from 'material-ui/svg-icons/hardware/keyboard-arrow-right';
import { toggleSidePanelExpanded } from '../actions';
import { TRANS_BLACK } from '../styles';

const SemiCircle = styled.div`
  position: absolute;
  top: 50%;
  left: -30px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: ${TRANS_BLACK};
  min-height: 60px;
  min-width: 30px;
  border-top-left-radius: 60px;
  border-bottom-left-radius: 60px;
  cursor: pointer;
  pointer-events: auto;
`;

const ExpandButtonComponent = props => {
  const arrowIcon = props.isSidePanelExpanded ? (
    <ArrowCloseIcon style={{ marginLeft: 5 }} />
  ) : (
    <ArrowOpenIcon style={{ marginLeft: 5 }} />
  );
  return <SemiCircle onClick={props.onExpandClick}>{arrowIcon}</SemiCircle>;
};

ExpandButtonComponent.propTypes = {
  isSidePanelExpanded: PropTypes.bool,
  onExpandClick: PropTypes.func.isRequired,
};

ExpandButtonComponent.defaultProps = {
  isSidePanelExpanded: false,
};

const mapStateToProps = state => {
  const { isSidePanelExpanded } = state.global;
  return {
    isSidePanelExpanded,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    onExpandClick: () => dispatch(toggleSidePanelExpanded()),
  };
};

export const ExpandButton = connect(mapStateToProps, mapDispatchToProps)(ExpandButtonComponent);
