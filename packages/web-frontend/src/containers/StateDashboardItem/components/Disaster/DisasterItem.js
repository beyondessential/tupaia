/**
 * Tupaia Web
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import moment from 'moment';

import { DashboardItemExpanderButton } from '../../../../components/DashboardItemExpanderButton';
import { selectDisaster } from '../../../../disaster/actions';

import { OFF_WHITE, BLUE } from '../../../../styles';

const Item = styled.div`
  position: relative;
  background-color: #272832;
  padding: 10px;
  margin: 0 4px;
  &:not(first-of-type) {
    margin-top: 4px;
  }
`;

const Key = styled.span`
  color: ${BLUE};
  display: flex;
  font-weight: 400;
  margin: 5px;
`;

const Value = styled.span`
  color: ${OFF_WHITE};
  font-weight: 300;
  margin: 5px 5px 5px 13px;
  &:last-of-type {
    margin-bottom: 10px;
  }
`;

const Title = styled.div`
  color: ${BLUE};
  display: flex;
  text-transform: capitalize;
  font-size: 21px;
  justify-content: center;
  font-weight: 500;
  padding: 10px;
  margin: 5px;
`;

const ButtonContainer = styled.div`
  margin-top: 15px;
`;

class DisasterItemDisplay extends React.Component {
  onClick = () => {
    const { info, onDisasterSelected } = this.props;
    onDisasterSelected(info);
  };

  render() {
    const { info } = this.props;
    const { name, location, startDate, type, status } = info;

    return (
      <Item>
        <Title>{name}</Title>

        <Key>Start: </Key>
        <Value>{!startDate ? status : moment(startDate).format('DD-MM-YYYY')}</Value>

        <Key>Type: </Key>
        <Value>{type}</Value>

        <Key>Location: </Key>
        <Value>{location}</Value>

        <ButtonContainer>
          <DashboardItemExpanderButton onEnlarge={this.onClick} helpText="View disaster" />
        </ButtonContainer>
      </Item>
    );
  }
}

DisasterItemDisplay.propTypes = {
  info: PropTypes.shape({
    name: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    startDate: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
  }).isRequired,
};

export const DisasterItem = connect(null, dispatch => ({
  onDisasterSelected: info => dispatch(selectDisaster(info)),
}))(DisasterItemDisplay);
