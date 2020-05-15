/**
 * Tupaia Web
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */

/**
 * Map
 *
 * The container for the leaflet Map in the background. Includes basic map setup/rendering,
 * controlled through props that are connected to the redux store. Rendering includes heatmaps
 * markers, polygons.
 */

import { connect } from 'react-redux';

import { CustomMap } from './CustomMap';

import {
  changeOrgUnit,
  changePosition,
  closeDropdownOverlays,
  setMapIsAnimating,
} from '../../actions';
import {
  selectHasPolygonMeasure,
  selectAllMeasuresWithDisplayInfo,
  selectOrgUnitChildren,
} from '../../selectors';

const mapStateToProps = state => {
  const {
    isAnimating,
    shouldSnapToPosition,
    position,
    innerAreas,
    measureInfo,
    tileSet,
  } = state.map;
  const {
    currentOrganisationUnit,
    currentOrganisationUnitSiblings,
    isSidePanelExpanded,
  } = state.global;
  const { contractedWidth, expandedWidth } = state.dashboard;

  // If the org unit's grandchildren are polygons and have a measure, display grandchildren
  // rather than children
  let displayedChilden = innerAreas;
  if (selectHasPolygonMeasure(state)) {
    const measureOrgUnits = selectAllMeasuresWithDisplayInfo(state);
    const measureOrgUnitCodes = measureOrgUnits.map(orgUnit => orgUnit.organisationUnitCode);
    console.log(measureOrgUnitCodes, innerAreas);
    const grandchildren = innerAreas
      .map(area => selectOrgUnitChildren(state, area.organisationUnitCode))
      .flat();

    const hasShadedGrandchildren =
      grandchildren &&
      grandchildren.some(child => measureOrgUnitCodes.includes(child.organisationUnitCode));
    if (hasShadedGrandchildren) displayedChilden = grandchildren;
  }

  return {
    position,
    innerAreas: displayedChilden,
    currentOrganisationUnit,
    currentOrganisationUnitSiblings,
    measureInfo,
    tileSet,
    isAnimating,
    shouldSnapToPosition,
    sidePanelWidth: isSidePanelExpanded ? expandedWidth : contractedWidth,
  };
};

const mapDispatchToProps = dispatch => ({
  changeOrgUnit: (organisationUnitCode, shouldChangeMapBounds = true) => {
    dispatch(changeOrgUnit(organisationUnitCode, shouldChangeMapBounds));
  },
  changePosition: (center, zoom) => dispatch(changePosition(center, zoom)),
  closeDropdownOverlays: () => dispatch(closeDropdownOverlays()),
  setMapIsAnimating: isAnimating => dispatch(setMapIsAnimating(isAnimating)),
});

export default connect(mapStateToProps, mapDispatchToProps)(CustomMap);
