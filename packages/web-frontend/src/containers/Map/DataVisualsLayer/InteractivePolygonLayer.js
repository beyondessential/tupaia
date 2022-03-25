/*
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 *
 */

import React, { memo } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { InteractivePolygon } from '@tupaia/ui-components/lib/map';

import { organisationUnitIsArea } from '../../../utils';
import {
  selectAreRegionLabelsPermanent,
  selectCurrentOrgUnit,
  selectHasPolygonMeasure,
  selectMeasuresWithDisplayInfo,
  selectOrgUnitChildren,
  selectOrgUnitSiblings,
} from '../../../selectors';

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

const mapStateToProps = state => {
  const { displayedMapOverlays } = state.map;
  const currentOrganisationUnit = selectCurrentOrgUnit(state);
  const currentChildren =
    selectOrgUnitChildren(state, currentOrganisationUnit.organisationUnitCode) || [];
  const permanentLabels = selectAreRegionLabelsPermanent(state);
  // orginal data
  // If the org unit's grandchildren are polygons and have a measure, display grandchildren
  // rather than children
  let displayedChildren = currentChildren;
  let measureOrgUnits = [];

  if (selectHasPolygonMeasure(state)) {
    measureOrgUnits = selectMeasuresWithDisplayInfo(state, displayedMapOverlays);
    const measureOrgUnitCodes = measureOrgUnits.map(orgUnit => orgUnit.organisationUnitCode);
    const grandchildren = currentChildren
      .map(area => selectOrgUnitChildren(state, area.organisationUnitCode))
      .reduce((acc, val) => acc.concat(val), []); // equivelent to .flat(), for IE

    const hasShadedGrandchildren =
      grandchildren &&
      grandchildren.some(child => measureOrgUnitCodes.includes(child.organisationUnitCode));
    if (hasShadedGrandchildren) displayedChildren = grandchildren;
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

const propsAreEqual = (prevProps, nextProps) => {
  // Only updates/re-renders when the measure has changed or the orgUnit has changed.
  // These are the only cases where polygons or area tooltips should rerender.
  if (JSON.stringify(prevProps.displayedChildren) !== JSON.stringify(nextProps.displayedChildren)) {
    return true;
  }

  if (
    prevProps.currentOrganisationUnit?.organisationUnitCode !==
    nextProps.currentOrganisationUnit?.organisationUnitCode
  ) {
    return true;
  }

  return false;
};

export const InteractivePolygonLayer = memo(
  connect(mapStateToProps)(InteractivePolygonLayerComponent),
  propsAreEqual,
);
