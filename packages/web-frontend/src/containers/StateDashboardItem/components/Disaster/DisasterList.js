/**
 * Tupaia Web
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { connect } from 'react-redux';

import { BLUE } from '../../../../styles';
import { DisasterItem } from './DisasterItem';

const Grid = styled.div`
  width: 100%;
  padding: 0px 4px 4px 4px;
`;

const NoDataMessage = styled.div`
  color: ${BLUE};
  padding: 0 20px;
  text-align: center;
  margin-bottom: 20px;
  font-size: 24px;
`;

function DisasterList(props) {
  const { disasters } = props;
  const items = Object.keys(disasters).map(disaster => {
    return <DisasterItem key={disaster} info={disasters[disaster]} />;
  });

  return (
    <Grid>{items.length > 0 ? items : <NoDataMessage>No Active Disasters</NoDataMessage>}</Grid>
  );
}

DisasterList.propTypes = {
  disasters: PropTypes.shape({}).isRequired,
};

const mapStateToProps = state => {
  const disasters = (state.disaster && state.disaster.disasters) || {};
  return { disasters };
};

export default connect(mapStateToProps)(DisasterList);
