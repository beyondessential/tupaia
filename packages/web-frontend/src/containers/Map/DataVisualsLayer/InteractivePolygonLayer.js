/*
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 *
 */

import React from 'react';
import { connect } from 'react-redux';
import { omitBy } from 'lodash';
import PropTypes from 'prop-types';

import { InteractivePolygon } from '@tupaia/ui-components';

import { organisationUnitIsArea } from '../../../utils';
import {
  selectAreRegionLabelsPermanent,
  selectCurrentOrgUnit,
  selectHasPolygonMeasure,
  selectMeasuresWithDisplayInfo,
  selectOrgUnitChildren,
  selectOrgUnitSiblings,
} from '../../../selectors';
import { selectCountryHierarchy } from '../../../selectors/orgUnitSelectors';

const InteractivePolygonLayerComponent = props => {
  const {
    currentOrganisationUnitSiblings,
    currentOrganisationUnit,
    displayedChildren,
    getChildren,
    hasMeasureData,
    onChangeOrgUnit,
    multiOverlayMeasureData,
    multiOverlaySerieses,
    measureOrgUnits,
    permanentLabels,
  } = props;

  const basicPropsForInteractivePolygon = {
    hasMeasureData,
    measureOrgUnits,
    multiOverlaySerieses,
    multiOverlayMeasureData,
    onChangeOrgUnit,
    permanentLabels,
  };

  return (
    <>
      {currentOrganisationUnit && organisationUnitIsArea(currentOrganisationUnit) && (
        <InteractivePolygon
          area={currentOrganisationUnit}
          organisationUnitChildren={getChildren(currentOrganisationUnit.organisationUnitCode)}
          isActive
          {...basicPropsForInteractivePolygon}
        />
      )}
      {displayedChildren?.map(area => (
        <InteractivePolygon
          area={area}
          key={area.organisationUnitCode}
          organisationUnitChildren={getChildren(area.organisationUnitCode)}
          isChildArea
          {...basicPropsForInteractivePolygon}
        />
      ))}
      {currentOrganisationUnitSiblings?.map(area => (
        <InteractivePolygon
          area={area}
          key={area.organisationUnitCode}
          organisationUnitChildren={getChildren(area.organisationUnitCode)}
          {...basicPropsForInteractivePolygon}
        />
      ))}
    </>
  );
};
InteractivePolygonLayerComponent.propTypes = {
  currentOrganisationUnitSiblings: PropTypes.array.isRequired,
  currentOrganisationUnit: PropTypes.object.isRequired,
  displayedChildren: PropTypes.arrayOf(PropTypes.object),
  getChildren: PropTypes.func.isRequired,
  hasMeasureData: PropTypes.bool,
  onChangeOrgUnit: PropTypes.func.isRequired,
  multiOverlayMeasureData: PropTypes.array,
  multiOverlaySerieses: PropTypes.array,
  measureOrgUnits: PropTypes.array,
  permanentLabels: PropTypes.bool,
};

InteractivePolygonLayerComponent.defaultProps = {
  displayedChildren: [],
  hasMeasureData: false,
  measureOrgUnits: [],
  multiOverlayMeasureData: [],
  multiOverlaySerieses: [],
  permanentLabels: undefined,
};

const mapStateToProps = (state, ownProps) => {
  const { displayedMapOverlayCodes } = ownProps;
  const currentOrganisationUnit = selectCurrentOrgUnit(state);
  const currentChildren =
    selectOrgUnitChildren(state, currentOrganisationUnit.organisationUnitCode) || [];
  const permanentLabels = selectAreRegionLabelsPermanent(state);
  const country = selectCountryHierarchy(state, currentOrganisationUnit.organisationUnitCode);

  // orginal data
  // If the org unit's grandchildren are polygons and have a measure, display grandchildren
  // rather than children
  let displayedChildren = currentChildren;
  let measureOrgUnits = [];

  if (selectHasPolygonMeasure(state)) {
    measureOrgUnits = selectMeasuresWithDisplayInfo(state, displayedMapOverlayCodes);
    const measureOrgUnitCodes = measureOrgUnits.map(orgUnit => orgUnit.organisationUnitCode);

    const getDisplayedDescendants = (parents, restOfOrgUnits = {}) => {
      if (!Array.isArray(parents) || parents.length === 0) return parents;
      const parentCodes = parents.map(area => area.organisationUnitCode);
      const children = Object.values(restOfOrgUnits).filter(orgUnit =>
        parentCodes.includes(orgUnit.parent),
      );

      if (children.length === 0) return null;

      // if this is the measure layer return it
      const hasShadedPolygonChildren =
        children &&
        children.some(
          child =>
            organisationUnitIsArea(child) &&
            measureOrgUnitCodes.includes(child.organisationUnitCode),
        );
      if (hasShadedPolygonChildren) return children;

      // otherwise look deeper
      return getDisplayedDescendants(
        children,
        omitBy(restOfOrgUnits, orgUnit => orgUnit.type === parents[0].type),
      );
    };

    const displayedDescendants = getDisplayedDescendants(
      currentChildren,
      omitBy(country, orgUnit => orgUnit.type === currentOrganisationUnit.type),
    );
    if (displayedDescendants) displayedChildren = displayedDescendants;
  }

  const getChildren = organisationUnitCode => selectOrgUnitChildren(state, organisationUnitCode);

  return {
    currentOrganisationUnit,
    displayedChildren,
    measureOrgUnits,
    currentOrganisationUnitSiblings: selectOrgUnitSiblings(
      state,
      currentOrganisationUnit.organisationUnitCode,
    ),
    getChildren,
    permanentLabels,
  };
};

export const InteractivePolygonLayer = connect(mapStateToProps)(InteractivePolygonLayerComponent);
