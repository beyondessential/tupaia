/**
 * Tupaia Web
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

import ZoomIcon from 'material-ui/svg-icons/action/zoom-in';

import { isMobile } from '../utils';
import { VIEW_STYLES, WHITE } from '../styles';

let ExpandButton = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  z-index: 1;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: black;
  opacity: ${p => (p.isHovered ? 0.7 : 0)};
  transition: opacity 0.2s;
  color: ${WHITE};
`;

if (isMobile()) {
  ExpandButton = styled.div`
    display: flex;
    justify-content: center;
    border: 1px solid ${WHITE};
    border-radius: 3px;
    padding: 5px;
    margin-top: 18px;
    box-shadow: 0 1px 4px 0 rgba(0, 0, 0, 0.3);
    cursor: pointer;
    div {
      align-self: center;
      padding-left: 10px;
    }
  `;
}

export class DashboardItemExpanderButton extends Component {
  state = {
    isHovered: false,
  };

  mouseOut = () => this.setState({ isHovered: false });

  mouseOver = () => this.setState({ isHovered: true });

  render() {
    const { onEnlarge, helpText } = this.props;

    return (
      <ExpandButton
        onMouseOver={this.mouseOver}
        isHovered={this.state.isHovered}
        onFocus={this.mouseOver}
        onKeyPress={this.mouseOver}
        onMouseOut={this.mouseOut}
        onBlur={this.mouseOut}
        onClick={onEnlarge}
        role="button"
        tabIndex={0}
      >
        <ZoomIcon style={VIEW_STYLES.expandButtonIcon} />
        <div>{helpText}</div>
      </ExpandButton>
    );
  }
}

DashboardItemExpanderButton.propTypes = {
  onEnlarge: PropTypes.func.isRequired,
  helpText: PropTypes.string.isRequired,
};
