/**
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { isNull } from 'lodash';
import { List } from 'material-ui/List';
import styled from 'styled-components';
import {
  selectCodeFromOrgUnit,
  selectOrgUnitChildren,
  selectCurrentProjectCode,
} from '../../selectors';
import { setOrgUnit } from '../../actions';
import { SearchBarItem } from '../../components/SearchBarItem';

const StyledList = styled(List)`
  background: rgba(38, 40, 52);
  height: 100%;
`;

const EntityHierarchy = ({ hierarchyData, orgUnitFetchError }) => {
  if (isNull(hierarchyData)) return <p>Loading countries...</p>;
  if (orgUnitFetchError) return <h2>Server error, try refresh</h2>;
  if (hierarchyData.length < 1) return null;

  const hierarchy = hierarchyData.map(item => (
    <SearchBarItem key={item} organisationUnitCode={item} nestedMargin="0px" />
  ));
  return <StyledList>{hierarchy}</StyledList>;
};

EntityHierarchy.propTypes = {
  hierarchyData: PropTypes.array,
  orgUnitFetchError: PropTypes.string,
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

const mapDispatchToProps = dispatch => ({
  onChangeOrgUnit: organisationUnitCode => {
    dispatch(setOrgUnit(organisationUnitCode));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(EntityHierarchy);
