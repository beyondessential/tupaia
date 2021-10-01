/**
 * Tupaia Web
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */

/**
 * MapOverlayBar
 *
 * Similar to LocationBar, provides measures in a grouped listing. Measures from redux state.
 * Updates redux state with action when a measure is selected. Map listens to this part of state
 * and renders appropriately.
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import shallowEqual from 'shallowequal';

import { Control } from './Control';
import {
  setMapOverlay,
  clearMeasure,
  toggleMeasureExpand,
  updateMeasureConfig,
} from '../../actions';
import { HierarchyItem } from '../../components/HierarchyItem';
import {
  selectCurrentOrgUnit,
  selectCurrentMapOverlays,
  selectDefaultMapOverlay,
  selectCurrentMapOverlayIds,
} from '../../selectors';
import { sortMapOverlayIdsByHierarchyOrder } from '../../utils';

export class MapOverlayBarComponent extends Component {
  constructor(props) {
    super(props);

    this.state = {
      hasNeverBeenChanged: true,
    };
  }

  shouldComponentUpdate(nextProps) {
    const propsAreUnchanged = shallowEqual(this.props, nextProps);
    if (propsAreUnchanged) return false;
    return true;
  }

  handleSelectMapOverlay = mapOverlay => {
    if (this.state.hasNeverBeenChanged) {
      this.setState({
        hasNeverBeenChanged: false,
      });
    }

    this.props.onSelectMapOverlay(mapOverlay.mapOverlayId);
  };

  renderDefaultMapOverlay() {
    const { currentMapOverlayIds, defaultMapOverlay } = this.props;
    if (!defaultMapOverlay) return null;
    return (
      <HierarchyItem
        nestedMargin="0px"
        label={defaultMapOverlay.name}
        isSelected={currentMapOverlayIds.includes(defaultMapOverlay.mapOverlayId)}
        onClick={() => this.handleSelectMapOverlay(defaultMapOverlay)}
      />
    );
  }

  renderNestedHierarchyItems(children) {
    const { currentMapOverlayIds, onUnSelectMapOverlay } = this.props;
    return children.map(childObject => {
      let nestedItems;

      if (childObject.children && childObject.children.length) {
        nestedItems = this.renderNestedHierarchyItems(childObject.children);
      }

      let onClick = null;

      if (!childObject.children) {
        onClick = currentMapOverlayIds.includes(childObject.mapOverlayId)
          ? () => onUnSelectMapOverlay(childObject.mapOverlayId)
          : () => this.handleSelectMapOverlay(childObject);
      }

      return (
        <HierarchyItem
          label={childObject.name}
          info={childObject.info}
          isSelected={
            childObject.children ? null : currentMapOverlayIds.includes(childObject.mapOverlayId)
          }
          key={childObject.mapOverlayId}
          onClick={onClick}
          nestedItems={nestedItems}
        />
      );
    });
  }

  renderHierarchy() {
    const { mapOverlayHierarchy, defaultMapOverlay } = this.props;

    const items = mapOverlayHierarchy.map(({ name: groupName, children, info }) => {
      if (!Array.isArray(children)) return null;
      const nestedItems = this.renderNestedHierarchyItems(children);
      if (nestedItems.length === 0) return null;
      return (
        <HierarchyItem
          nestedMargin="0px"
          label={groupName}
          info={info}
          nestedItems={nestedItems}
          key={groupName}
        />
      );
    });
    return (
      <>
        {defaultMapOverlay?.mapOverlayId ? this.renderDefaultMapOverlay() : null}
        {items}
      </>
    );
  }

  renderEmptyMessage() {
    const { currentOrganisationUnitName } = this.props;
    const orgName = currentOrganisationUnitName || 'Your current selection';

    return `Select an area with valid data. ${orgName} has no map overlays available.`;
  }

  render() {
    const {
      currentMapOverlays,
      isMeasureLoading,
      currentOrganisationUnitName,
      onUpdateMeasurePeriod,
    } = this.props;
    const orgName = currentOrganisationUnitName || 'Your current selection';
    const emptyMessage = `Select an area with valid data. ${orgName} has no map overlays available.`;
    // TODO: select multiple map overlays
    return (
      <Control
        emptyMessage={emptyMessage}
        selectedMapOverlays={currentMapOverlays}
        isMeasureLoading={isMeasureLoading}
        onUpdateMeasurePeriod={onUpdateMeasurePeriod}
      >
        {this.renderHierarchy()}
      </Control>
    );
  }
}

const MapOverlayShape = PropTypes.shape({
  mapOverlayId: PropTypes.string,
  name: PropTypes.string,
  periodGranularity: PropTypes.string,
  datePickerLimits: PropTypes.string,
  isTimePeriodEditable: PropTypes.string,
});

MapOverlayBarComponent.propTypes = {
  currentMapOverlayIds: PropTypes.arrayOf(PropTypes.string),
  currentMapOverlays: PropTypes.arrayOf(MapOverlayShape),
  mapOverlayHierarchy: PropTypes.array.isRequired,
  isExpanded: PropTypes.bool.isRequired,
  isMeasureLoading: PropTypes.bool.isRequired,
  onSelectMapOverlay: PropTypes.func.isRequired,
  onUnSelectMapOverlay: PropTypes.func.isRequired,
  onUpdateMeasurePeriod: PropTypes.func.isRequired,
  currentOrganisationUnitName: PropTypes.string,
  defaultMapOverlay: MapOverlayShape,
};

MapOverlayBarComponent.defaultProps = {
  currentMapOverlayIds: [],
  currentOrganisationUnitName: '',
  defaultMapOverlay: null,
  currentMapOverlays: [],
};

const mapStateToProps = state => {
  const { mapOverlayHierarchy, isExpanded } = state.mapOverlayBar;
  const { isMeasureLoading } = state.map;
  const { isLoadingOrganisationUnit } = state.global;

  const currentOrganisationUnit = selectCurrentOrgUnit(state);
  const currentMapOverlays = selectCurrentMapOverlays(state);

  const currentMapOverlayIds = selectCurrentMapOverlayIds(state);
  const defaultMapOverlay = selectDefaultMapOverlay(state);

  return {
    currentMapOverlays,
    currentMapOverlayIds,
    mapOverlayHierarchy,
    isExpanded,
    currentOrganisationUnitName: currentOrganisationUnit.name,
    isMeasureLoading: isMeasureLoading || isLoadingOrganisationUnit,
    defaultMapOverlay,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    onExpandClick: () => dispatch(toggleMeasureExpand()),
    onSetMapOverlay: mapOverlayIds => dispatch(setMapOverlay(mapOverlayIds)),
    onClearMeasure: () => dispatch(clearMeasure()),
    dispatch,
  };
};

const mergeProps = (stateProps, dispatchProps, ownProps) => {
  const { dispatch, onSetMapOverlay, onClearMeasure } = dispatchProps;
  const { currentMapOverlayIds, mapOverlayHierarchy } = stateProps;
  const onSelectMapOverlay = mapOverlayId => {
    const mapOverlayIds = sortMapOverlayIdsByHierarchyOrder(mapOverlayHierarchy, [
      ...currentMapOverlayIds,
      mapOverlayId,
    ]);
    onSetMapOverlay(mapOverlayIds.join(','));
  };
  const onUnSelectMapOverlay = mapOverlayId => {
    const updatedMapOverlayIds = currentMapOverlayIds.filter(
      currentMapOverlayId => currentMapOverlayId !== mapOverlayId,
    );
    if (updatedMapOverlayIds.length > 0) {
      onSetMapOverlay(updatedMapOverlayIds.join(','));
    } else {
      onClearMeasure();
    }
  };

  return {
    ...stateProps,
    ...dispatchProps,
    ...ownProps,
    onUpdateMeasurePeriod: (startDate, endDate) =>
      dispatch(updateMeasureConfig(currentMapOverlayIds[0], { startDate, endDate })),
    onSelectMapOverlay,
    onUnSelectMapOverlay,
  };
};

export const MapOverlayBar = connect(
  mapStateToProps,
  mapDispatchToProps,
  mergeProps,
)(MapOverlayBarComponent);
