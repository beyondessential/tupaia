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

const mapStateToProps = state => {
  const {
    isAnimating,
    shouldSnapToPosition,
    position,
    focussedOrganisationUnit,
    innerAreas,
    measureInfo,
    tileSet,
  } = state.map;
  const {
    highlightedOrganisationUnit,
    currentOrganisationUnit,
    currentOrganisationUnitSiblings,
    isSidePanelExpanded,
  } = state.global;
  const { contractedWidth, expandedWidth } = state.dashboard;

  return {
    position,
    innerAreas,
    currentOrganisationUnit,
    highlightedOrganisationUnit,
    currentOrganisationUnitSiblings,
    measureInfo,
    tileSet,
    focussedOrganisationUnit: focussedOrganisationUnit,
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
