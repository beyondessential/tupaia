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
  selectOrgUnit,
  selectCurrentOrgUnit,
  selectOrgUnitSiblings,
  selectOrgUnitChildren,
  selectHasPolygonMeasure,
  selectAllMeasuresWithDisplayInfo,
} from '../../selectors';

import {
  changeOrgUnit,
  changePosition,
  closeDropdownOverlays,
  setMapIsAnimating,
} from '../../actions';

const mapStateToProps = state => {
  const { isAnimating, shouldSnapToPosition, position, measureInfo, tileSet } = state.map;
  const { isSidePanelExpanded } = state.global;
  const { contractedWidth, expandedWidth } = state.dashboard;
  const currentOrganisationUnit = selectCurrentOrgUnit(state);
  const currentParent = selectOrgUnit(state, currentOrganisationUnit.parent);
  const currentChildren =
    selectOrgUnitChildren(state, currentOrganisationUnit.organisationUnitCode) || [];

  // If the org unit's grandchildren are polygons and have a measure, display grandchildren
  // rather than children
  let displayedChildren = currentChildren;
  if (selectHasPolygonMeasure(state)) {
    const measureOrgUnits = selectAllMeasuresWithDisplayInfo(state);
    const measureOrgUnitCodes = measureOrgUnits.map(orgUnit => orgUnit.organisationUnitCode);
    const grandchildren = currentChildren
      .map(area => selectOrgUnitChildren(state, area.organisationUnitCode))
      .reduce((acc, val) => acc.concat(val), []); // equivelent to .flat(), for IE

    const hasShadedGrandchildren =
      grandchildren &&
      grandchildren.some(child => measureOrgUnitCodes.includes(child.organisationUnitCode));
    if (hasShadedGrandchildren) displayedChildren = grandchildren;
  }

  return {
    position,
    currentOrganisationUnit,
    currentParent,
    displayedChildren,
    currentOrganisationUnitSiblings: selectOrgUnitSiblings(
      state,
      currentOrganisationUnit.organisationUnitCode,
    ),
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
