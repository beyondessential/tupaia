/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import { Map } from '../Map';
import {
  selectOrgUnit,
  selectCurrentOrgUnit,
  selectOrgUnitSiblings,
  selectOrgUnitChildren,
  selectHasPolygonMeasure,
  selectAllMeasuresWithDisplayInfo,
  selectRenderedMeasuresWithDisplayInfo,
  selectCurrentMeasureId,
  selectAreRegionLabelsPermanent,
} from '../../../selectors';
import { selectActiveTileSet } from '../../../selectors/projectSelectors';
import {
  setOrgUnit,
  changePosition,
  closeDropdownOverlays,
  setMapIsAnimating,
} from '../../../actions';
import { ConnectedPolygon } from './ConnectedPolygon';

const PolygonComponent = React.memo(
  ({
    measureData,
    measureOrgUnits,
    measureInfo,
    measureId,
    onChangeOrgUnit,
    permanentLabels,
    ...props
  }) => {
    const { measureOptions } = measureInfo;

    return (
      <ConnectedPolygon
        hasMeasureData={measureData && measureData.length > 0}
        measureOptions={measureOptions}
        measureId={measureId}
        measureOrgUnits={measureOrgUnits}
        permanentLabels={permanentLabels}
        onChangeOrgUnit={onChangeOrgUnit}
        {...props}
      />
    );
  },
);

const selectMeasureDataWithCoordinates = createSelector([measureData => measureData], measureData =>
  measureData.map(({ location, ...otherData }) => ({
    ...otherData,
    coordinates: location && location.point,
    region: location && location.region,
  })),
);

const mapStateToProps = state => {
  const { isAnimating, shouldSnapToPosition, position, measureInfo } = state.map;
  const { isSidePanelExpanded } = state.global;
  const { contractedWidth, expandedWidth } = state.dashboard;
  const currentOrganisationUnit = selectCurrentOrgUnit(state);
  const currentParent = selectOrgUnit(state, currentOrganisationUnit.parent);
  const currentChildren =
    selectOrgUnitChildren(state, currentOrganisationUnit.organisationUnitCode) || [];

  // If the org unit's grandchildren are polygons and have a measure, display grandchildren
  // rather than children
  let displayedChildren = currentChildren;
  let measureOrgUnits = [];

  if (selectHasPolygonMeasure(state)) {
    measureOrgUnits = selectAllMeasuresWithDisplayInfo(state);
    const measureOrgUnitCodes = measureOrgUnits.map(orgUnit => orgUnit.organisationUnitCode);
    const grandchildren = currentChildren
      .map(area => selectOrgUnitChildren(state, area.organisationUnitCode))
      .reduce((acc, val) => acc.concat(val), []); // equivelent to .flat(), for IE

    const hasShadedGrandchildren =
      grandchildren &&
      grandchildren.some(child => measureOrgUnitCodes.includes(child.organisationUnitCode));
    if (hasShadedGrandchildren) displayedChildren = grandchildren;
  }

  const measureData = selectMeasureDataWithCoordinates(
    selectRenderedMeasuresWithDisplayInfo(state),
  );

  const measureId = selectCurrentMeasureId(state);
  const permanentLabels = selectAreRegionLabelsPermanent(state);

  const getChildren = organisationUnitCode => selectOrgUnitChildren(state, organisationUnitCode);

  return {
    position,
    currentOrganisationUnit,
    currentParent,
    displayedChildren,
    measureData,
    currentOrganisationUnitSiblings: selectOrgUnitSiblings(
      state,
      currentOrganisationUnit.organisationUnitCode,
    ),
    measureInfo,
    getChildren,
    measureId,
    permanentLabels,
    measureOrgUnits,
    tileSetUrl: selectActiveTileSet(state).url,
    isAnimating,
    shouldSnapToPosition,
    sidePanelWidth: isSidePanelExpanded ? expandedWidth : contractedWidth,
  };
};

const mapDispatchToProps = dispatch => ({
  setOrgUnit: (organisationUnitCode, shouldChangeMapBounds = true) => {
    dispatch(setOrgUnit(organisationUnitCode, shouldChangeMapBounds));
  },
  onChangeOrgUnit: (organisationUnitCode, shouldChangeMapBounds = true) => {
    dispatch(setOrgUnit(organisationUnitCode, shouldChangeMapBounds));
  },
  changePosition: (center, zoom) => dispatch(changePosition(center, zoom)),
  closeDropdownOverlays: () => dispatch(closeDropdownOverlays()),
  setMapIsAnimating: isAnimating => dispatch(setMapIsAnimating(isAnimating)),
});

export const PolygonWrapper = connect(mapStateToProps, mapDispatchToProps)(PolygonComponent);
