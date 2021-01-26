/**
 * Tupaia Web
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */

/**
 * ControlBar
 *
 * This is the base component for the search bar and measure bar. Children in JSX will be rendered
 * on expansion.
 *
 * @prop {string} value The value being typed into the bar for search
 * @prop {boolean} isExpanded Will change the expanded state of ControlBar
 * @prop {function} onSearchChange Callback for changing the data prop when value is changed
 * @prop {function} onExpandClick Callback for what to do when expand is clicked
 * @prop {object} icon Define icon to use, should be react component
 * @prop {string} hintText The text displayed until user enters a value.
 * @prop {array} children Children components in JSX will be rendered in expansion
 */

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import OpenIcon from 'material-ui/svg-icons/navigation/arrow-drop-down';
import CloseIcon from 'material-ui/svg-icons/navigation/arrow-drop-up';
import Marker from 'material-ui/svg-icons/maps/add-location';
import TextField from 'material-ui/TextField';
import { TRANS_BLACK, CONTROL_BAR_WIDTH, MAP_OVERLAY_SELECTOR, WHITE } from '../styles';

const wrapperPadding = 14;

const Container = styled.div`
  display: flex;
  flex-grow: ${props => (props.expanded ? 1 : 0)};
  flex-shrink: ${props => (props.expanded ? 1 : 0)};
  flex-basis: ${props => (props.expanded ? '160px' : '50px')};
  background-color: ${TRANS_BLACK};
  border-radius: 8px;
  width: ${CONTROL_BAR_WIDTH}px;
  flex-direction: column;
  pointer-events: auto;
  cursor: auto;
  transition: 0.5s;
  min-height: 0; /* firefox vertical scroll */
  ${props => props.style};
`;

const TopBar = styled.div`
  display: flex;
  flex-shrink: 0;
  flex-direction: row;
  align-items: center;
  height: 50px;
  padding-left: ${wrapperPadding}px;
  padding-right: ${wrapperPadding}px;
`;

const Text = styled.div`
  display: flex;
  flex-grow: 1;
  flex-shrink: 1;
  flex-basis: 0%;
  padding-left: 2px;
  margin: 3px;
  color: ${WHITE};
  font-size: 16px;
  align-items: center;
  align-self: stretch;
`;

const Expansion = styled.div`
  display: flex;
  flex-grow: 1;
  flex-shrink: 1;
  flex-basis: 0%;
  flex-direction: column;
  color: ${WHITE};
  padding-bottom: 10px;
  background: rgba(255, 255, 255, 0.1);
  margin: 1px;
  padding-left: ${wrapperPadding}px;
  padding-right: ${wrapperPadding}px;
  overflow: hidden;
`;

const TopBarExpansion = styled.div`
  color: ${WHITE};
  padding-bottom: 10px;
  background: rgba(255, 255, 255, 0.1);
  margin: 1px;
  padding-left: ${wrapperPadding}px;
  padding-right: ${wrapperPadding}px;
  overflow: hidden;
  border-radius: 0 0 8px 8px;
`;

const IconContainer = styled.div`
  max-width: 24px;
  max-height: 26px;
  overflow: hidden;
  margin-right: 0.2rem;
`;

export class ControlBar extends PureComponent {
  render() {
    const {
      value,
      isExpanded,
      onSearchChange,
      onExpandClick,
      icon,
      hintText,
      children,
      inTopBar,
      style,
    } = this.props;

    const ExpansionDiv = inTopBar ? TopBarExpansion : Expansion;

    const searchChange = !isExpanded
      ? event => {
          onSearchChange(event);
          onExpandClick(); // Should expand if it was not expanded
        }
      : onSearchChange;
    const searchFocus = !isExpanded
      ? () => {
          onExpandClick();
        }
      : null;
    const ExpandIcon = props =>
      isExpanded ? (
        <CloseIcon {...props} onClick={onExpandClick} />
      ) : (
        <OpenIcon {...props} onClick={onExpandClick} />
      );

    const text = !onSearchChange ? (
      <Text
        style={{ marginRight: 14, borderRight: MAP_OVERLAY_SELECTOR.border }}
        onClick={onExpandClick}
      >
        {value || 'Select your map data'}
      </Text>
    ) : (
      <TextField
        name="ControlBarField"
        onChange={searchChange}
        onFocus={searchFocus}
        hintText={hintText}
        underlineShow={false}
        autoComplete="off"
        style={{
          flexGrow: 1,
          flexShrink: 1,
          flexBasis: '0%',
          paddingLeft: 6,
        }}
      />
    );

    return (
      <Container onBlur={this.props.onControlBlur} expanded={isExpanded} style={style}>
        <TopBar>
          <IconContainer>{icon}</IconContainer>
          {text}
          <ExpandIcon />
        </TopBar>
        {isExpanded ? <ExpansionDiv>{children}</ExpansionDiv> : null}
      </Container>
    );
  }
}

ControlBar.propTypes = {
  ...TextField.propTypes,
  value: PropTypes.string,
  isExpanded: PropTypes.bool,
  onSearchChange: PropTypes.func,
  onSearchFocus: PropTypes.func,
  onExpandClick: PropTypes.func.isRequired,
  inTopBar: PropTypes.bool,
  icon: PropTypes.node,
  hintText: PropTypes.string,
};

ControlBar.defaultProps = {
  value: '',
  isExpanded: false,
  icon: <Marker />,
  inTopBar: false,
  hintText: '',
  onSearchFocus: undefined,
  onSearchChange: undefined,
};
