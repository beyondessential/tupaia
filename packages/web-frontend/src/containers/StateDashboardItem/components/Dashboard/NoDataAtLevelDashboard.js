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
  background: #272832;
  color: ${WHITE};
`;

const FullWidthRow = styled.div`
  grid-column: 1 / -1;
  padding: 16px;
`;

function NoDataAtLevel({ currentOrgUnitType }) {
  const description = `No project data is currently available ${
    currentOrgUnitType === 'Project'
      ? 'at the project level view'
      : `for the selected ${currentOrgUnitType.toLowerCase()}`
  }. If you expected to see data displayed in this view, 
  please contact the project coordinators for a timeline on these data being made available.`;

  return (
    <Grid>
      <FullWidthRow>{description}</FullWidthRow>
    </Grid>
  );
}

NoDataAtLevel.propTypes = {
  currentOrgUnitType: PropTypes.string,
};

NoDataAtLevel.defaultProps = {
  currentOrgUnitType: 'area',
};

const mapStateToProps = state => {
  const currentOrgUnit = selectCurrentOrgUnit(state);

  return {
    currentOrgUnitType: currentOrgUnit.type,
  };
};

export default connect(mapStateToProps)(NoDataAtLevel);
