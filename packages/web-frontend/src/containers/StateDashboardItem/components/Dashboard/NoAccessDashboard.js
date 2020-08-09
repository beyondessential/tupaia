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

import { WHITE } from '../../../../styles';
import { selectCurrentOrgUnit } from '../../../../selectors';

const Grid = styled.div`
  display: grid;
  grid-template-columns: auto;
  grid-template-rows: auto auto;
  text-align: center;
  position: relative;
  background: #272832;
  color: ${WHITE};
`;

const FullWidthRow = styled.div`
  grid-column: 1 / -1;
  padding: 16px;
`;

function NoAccessDashboard({ currentOrgUnitType }) {
  const description = `You do not currently have access to view project data ${
    currentOrgUnitType === 'Project'
      ? 'at the project level view'
      : `for the selected ${currentOrgUnitType.toLowerCase()}`
  }. If you believe you should be granted access to view this data, 
  please click on your profile name at the top of the screen 
  and select ‘Request Country Access’ or send an email directly to the project coordinators.`;
  return (
    <Grid>
      <FullWidthRow>{description}</FullWidthRow>
    </Grid>
  );
}

NoAccessDashboard.propTypes = {
  currentOrgUnitType: PropTypes.string,
};

NoAccessDashboard.defaultProps = {
  currentOrgUnitType: 'area',
};

const mapStateToProps = state => {
  const currentOrgUnit = selectCurrentOrgUnit(state);

  return {
    currentOrgUnitType: currentOrgUnit.type,
  };
};

export default connect(mapStateToProps)(NoAccessDashboard);
