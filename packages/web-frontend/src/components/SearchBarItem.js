/**
 * Tupaia Web
 * Copyright (c) 2020 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */

import FacilityIcon from 'material-ui/svg-icons/maps/local-hospital';
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { createSelector } from 'reselect';
import { connect } from 'react-redux';
import { HierarchyItem } from './HierarchyItem';
import { setOrgUnit, openMapPopup } from '../actions';
import { selectOrgUnit, selectOrgUnitChildren } from '../selectors';

const ICON_BY_ORG_UNIT_TYPE = {
  Facility: FacilityIcon,
};

const SearchBarItemComponent = ({
  organisationUnitCode,
  name,
  organisationUnitChildren,
  isLoading,
  type,
  onClick,
  nestedMargin,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const nestedItems = isExpanded
    ? organisationUnitChildren.map(child => (
        <SearchBarItem key={child} organisationUnitCode={child} />
      ))
    : [];
  return (
    <HierarchyItem
      key={organisationUnitCode}
      label={name}
      nestedMargin={nestedMargin}
      nestedItems={nestedItems}
      hasNestedItems={type === 'Country' || organisationUnitChildren.length > 0}
      isLoading={isLoading}
      Icon={ICON_BY_ORG_UNIT_TYPE[type]}
      onClick={() => {
        setIsExpanded(!isExpanded);
        onClick(organisationUnitCode);
      }}
    />
  );
};

SearchBarItemComponent.propTypes = {
  organisationUnitCode: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  isLoading: PropTypes.bool,
  organisationUnitChildren: PropTypes.arrayOf(PropTypes.string),
  onClick: PropTypes.func.isRequired,
  nestedMargin: PropTypes.string,
};

SearchBarItemComponent.defaultProps = {
  organisationUnitChildren: [],
  isLoading: false,
  nestedMargin: undefined,
};

const sortOrgUnitsAlphabeticallyByName = orgUnits => {
  // Sort countries alphabetically, this may not be the case if one country was loaded first
  return orgUnits.concat().sort((data1, data2) => {
    if (data1.name > data2.name) return 1;
    if (data1.name < data2.name) return -1;
    return 0;
  });
};

const selectCodeFromOrgUnit = createSelector([orgUnits => orgUnits], orgUnits =>
  sortOrgUnitsAlphabeticallyByName(orgUnits).map(orgUnit => orgUnit.organisationUnitCode),
);

const mapStateToProps = (state, props) => {
  const orgUnit = selectOrgUnit(state, props.organisationUnitCode);
  const { name, isLoading, type } = orgUnit;
  const organisationUnitChildren = selectCodeFromOrgUnit(
    selectOrgUnitChildren(state, props.organisationUnitCode),
  );
  return { name, isLoading, type, organisationUnitChildren };
};

const mapDispatchToProps = dispatch => {
  return {
    onClick: organisationUnitCode => {
      dispatch(setOrgUnit(organisationUnitCode));
      dispatch(openMapPopup(organisationUnitCode));
    },
  };
};

export const SearchBarItem = connect(mapStateToProps, mapDispatchToProps)(SearchBarItemComponent);
