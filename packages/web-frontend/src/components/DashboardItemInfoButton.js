/**
 * Tupaia Web
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

import InfoIcon from 'material-ui/svg-icons/action/info';

import { isMobile } from '../utils';
import { WHITE } from '../styles';

const shouldDisplayForMobile = isMobile();

const InfoButton = styled.div`
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
  opacity: ${p => (p.shouldShowText ? 0.9 : 0)};
  transition: opacity 0.2s;
  color: ${WHITE};
  padding: 15px;
`;

const MobileInfoButton = styled.div`
  display: flex;
  justify-content: center;
  border: 1px solid ${WHITE};
  border-radius: 3px;
  padding: 5px;
  box-shadow: 0 1px 4px 0 rgba(0, 0, 0, 0.3);
  cursor: pointer;
`;

const CallToAction = styled.div`
  align-self: center;
  padding-left: 10px;
`;

const InfoText = styled.div`
  padding: ${shouldDisplayForMobile && '7.5px'};
  padding-top: 7.5px;
`;

const Content = styled.div`
  display: flex;
`;

export class DashboardItemInfoButton extends Component {
  state = {
    shouldShowText: false,
  };

  mouseOut = () => this.setState({ shouldShowText: false });

  mouseOver = () => this.setState({ shouldShowText: true });

  toggleInfoText = () => {
    this.setState(state => ({ shouldShowText: !state.shouldShowText }));
  };

  renderMobileContent = () => {
    const { shouldShowText } = this.state;
    let content;
    if (shouldShowText) {
      content = <InfoText>{this.props.infoText}</InfoText>;
    } else {
      content = (
        <Content>
          <InfoIcon />
          <CallToAction>View more info</CallToAction>
        </Content>
      );
    }

    return (
      <MobileInfoButton
        onFocus={this.mouseOver}
        onBlur={this.mouseOut}
        onClick={this.toggleInfoText}
        role="button"
        tabIndex={0}
      >
        {content}
      </MobileInfoButton>
    );
  };

  renderContent = () => {
    return (
      <InfoButton
        onMouseOver={this.mouseOver}
        shouldShowText={this.state.shouldShowText}
        onFocus={this.mouseOver}
        onKeyPress={this.mouseOver}
        onMouseOut={this.mouseOut}
        onBlur={this.mouseOut}
        role="button"
        tabIndex={0}
      >
        <InfoIcon />
        <InfoText>{this.props.infoText}</InfoText>
      </InfoButton>
    );
  };

  render() {
    if (shouldDisplayForMobile) {
      return this.renderMobileContent();
    }
    return this.renderContent();
  }
}

DashboardItemInfoButton.propTypes = {
  infoText: PropTypes.string.isRequired,
};
