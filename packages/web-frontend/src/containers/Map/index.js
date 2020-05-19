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
} from '../../selectors';

import {
  changeOrgUnit,
  changePosition,
  closeDropdownOverlays,
  setMapIsAnimating,
} from '../../actions';

const mapStateToProps = state => {
  const { isAnimating, shouldSnapToPosition, position, measureInfo, tileSet } = state.map;
  const { currentOrganisationUnitCode, isSidePanelExpanded } = state.global;
  const { contractedWidth, expandedWidth } = state.dashboard;
  const currentOrganisationUnit = selectCurrentOrgUnit(state);
  const currentParent = selectOrgUnit(state, currentOrganisationUnit.parent);
  const currentChildren = selectOrgUnitChildren(state, currentOrganisationUnitCode);

  return {
    position,
    currentOrganisationUnit,
    currentParent,
    currentChildren,
    currentOrganisationUnitSiblings: selectOrgUnitSiblings(state, currentOrganisationUnitCode),
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
