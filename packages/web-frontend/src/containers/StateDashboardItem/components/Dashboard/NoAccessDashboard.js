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
import Button from '@material-ui/core/Button';

import { WHITE } from '../../../../styles';
import { selectCurrentOrgUnit, selectActiveProject } from '../../../../selectors';

import { REQUEST_PROJECT_ACCESS } from '../../../OverlayDiv/constants';
import { setRequestingAccess } from '../../../../projects/actions';
import { setOverlayComponent } from '../../../../actions';

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

function NoAccessDashboard({ currentOrgUnitType, project, onRequestProjectAccess }) {
  const noAccessMessage = `You do not currently have access to view project data ${
    currentOrgUnitType === 'Project'
      ? 'at the project level view'
      : `for the selected ${currentOrgUnitType.toLowerCase()}`
  }.`;
  const requestAccessMessage = `If you believe you should be granted access to view this data, 
  you may`;
  return (
    <Grid>
      <FullWidthRow>{noAccessMessage}</FullWidthRow>
      <FullWidthRow>
        {requestAccessMessage}
        <Button onClick={() => onRequestProjectAccess(project)} color="primary">
          Request access
        </Button>
      </FullWidthRow>
    </Grid>
  );
}

NoAccessDashboard.propTypes = {
  currentOrgUnitType: PropTypes.string,
  project: PropTypes.object,
  onRequestProjectAccess: PropTypes.func,
};

NoAccessDashboard.defaultProps = {
  currentOrgUnitType: 'area',
  project: {},
  onRequestProjectAccess: () => {},
};

const mapStateToProps = state => {
  const currentOrgUnit = selectCurrentOrgUnit(state);

  return {
    project: selectActiveProject(state),
    currentOrgUnitType: currentOrgUnit.type,
  };
};

const mapDispatchToProps = dispatch => ({
  onRequestProjectAccess: project => {
    dispatch(setRequestingAccess(project));
    dispatch(setOverlayComponent(REQUEST_PROJECT_ACCESS));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(NoAccessDashboard);
