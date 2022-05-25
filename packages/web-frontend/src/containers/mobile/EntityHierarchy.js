/**
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { isNull } from 'lodash';
import List from '@material-ui/core/List';
import styled from 'styled-components';
import {
  selectCodeFromOrgUnit,
  selectOrgUnitChildren,
  selectCurrentProjectCode,
} from '../../selectors';
import { SearchBarItem } from '../../components/SearchBarItem';

const StyledList = styled(List)`
  background: black;
  min-height: 100%;
  padding: 0;
`;

const EntityHierarchy = ({ hierarchyData, orgUnitFetchError, onClick }) => {
  if (isNull(hierarchyData)) return <p>Loading countries...</p>;
  if (orgUnitFetchError) return <h2>Server error, try refresh</h2>;
  if (hierarchyData.length < 1) return null;

  const hierarchy = useMemo(
    () =>
      hierarchyData.map((item, index) => (
        <SearchBarItem
          key={item}
          organisationUnitCode={item}
          onClick={onClick}
          isFinalRow={index === hierarchyData.length - 1}
        />
      )),
    [hierarchyData, onClick],
  );
  return <StyledList>{hierarchy}</StyledList>;
};

EntityHierarchy.propTypes = {
  hierarchyData: PropTypes.array,
  orgUnitFetchError: PropTypes.string,
  onClick: PropTypes.func.isRequired,
};

EntityHierarchy.defaultProps = {
  hierarchyData: null,
  orgUnitFetchError: null,
};

const mapStateToProps = state => {
  const { orgUnitFetchError } = state.orgUnits;
  const hierarchyData = selectCodeFromOrgUnit(
    selectOrgUnitChildren(state, selectCurrentProjectCode(state)),
  );

  return {
    orgUnitFetchError,
    hierarchyData,
  };
};

export default connect(mapStateToProps)(EntityHierarchy);
