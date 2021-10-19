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
  setMapOverlays,
  clearMeasure,
  toggleMeasureExpand,
  updateMeasureConfig,
} from '../../actions';
import { HierarchyItem } from '../../components/HierarchyItem';
import {
  selectCurrentOrgUnit,
  selectCurrentMapOverlays,
  selectDefaultMapOverlay,
  selectCurrentMapOverlayCodes,
} from '../../selectors';

const MAX_SELECTED_OVERLAYS = 2;
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

  handleSelectMapOverlay = (mapOverlay, isSelected) => {
    if (this.state.hasNeverBeenChanged) {
      this.setState({
        hasNeverBeenChanged: false,
      });
    }

    if (isSelected) {
      this.props.onUnSelectMapOverlay(mapOverlay.mapOverlayCode);
    } else {
      this.props.onSelectMapOverlay(mapOverlay.mapOverlayCode);
    }
  };

  renderDefaultMapOverlay() {
    const { currentMapOverlayCodes, defaultMapOverlay } = this.props;
    if (!defaultMapOverlay) {
      return null;
    }

    const isSelected = currentMapOverlayCodes.includes(defaultMapOverlay.mapOverlayCode);

    return (
      <HierarchyItem
        nestedMargin="0px"
        label={defaultMapOverlay.name}
        isSelected={isSelected}
        onClick={() => this.handleSelectMapOverlay(defaultMapOverlay, isSelected)}
      />
    );
  }

  renderNestedHierarchyItems(children) {
    const { currentMapOverlayCodes } = this.props;
    return children.map(childObject => {
      let nestedItems;
      if (childObject.children && childObject.children.length) {
        nestedItems = this.renderNestedHierarchyItems(childObject.children);
      }

      const isSelected = childObject.children
        ? null
        : currentMapOverlayCodes.includes(childObject.mapOverlayCode);

      let onClick = null;
      if (!childObject.children) {
        onClick = () => this.handleSelectMapOverlay(childObject, isSelected);
      }

      return (
        <HierarchyItem
          label={childObject.name}
          info={childObject.info}
          isSelected={isSelected}
          key={childObject.mapOverlayCode}
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
        {defaultMapOverlay?.mapOverlayCode ? this.renderDefaultMapOverlay() : null}
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
  mapOverlayCode: PropTypes.string,
  name: PropTypes.string,
  periodGranularity: PropTypes.string,
  datePickerLimits: PropTypes.string,
  isTimePeriodEditable: PropTypes.string,
});

MapOverlayBarComponent.propTypes = {
  currentMapOverlayCodes: PropTypes.arrayOf(PropTypes.string),
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
  currentMapOverlayCodes: [],
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

  const currentMapOverlayCodes = selectCurrentMapOverlayCodes(state);
  const defaultMapOverlay = selectDefaultMapOverlay(state);

  return {
    currentMapOverlays,
    currentMapOverlayCodes,
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
    onSetMapOverlay: mapOverlayCodes => dispatch(setMapOverlays(mapOverlayCodes.join(','))),
    onClearMeasure: () => dispatch(clearMeasure()),
    dispatch,
  };
};

const mergeProps = (stateProps, dispatchProps, ownProps) => {
  const { dispatch, onSetMapOverlay, onClearMeasure } = dispatchProps;
  const { currentMapOverlayCodes } = stateProps;
  const onSelectMapOverlay = mapOverlayCode => {
    const newMapOverlayCodes = [...currentMapOverlayCodes, mapOverlayCode];
    if (newMapOverlayCodes.length > MAX_SELECTED_OVERLAYS) {
      newMapOverlayCodes.shift();
    }
    onSetMapOverlay(newMapOverlayCodes);
  };
  const onUnSelectMapOverlay = mapOverlayCode => {
    const updatedMapOverlayCodes = currentMapOverlayCodes.filter(
      currentMapOverlayCode => currentMapOverlayCode !== mapOverlayCode,
    );
    if (updatedMapOverlayCodes.length > 0) {
      onSetMapOverlay(updatedMapOverlayCodes);
    } else {
      onClearMeasure();
    }
  };

  return {
    ...stateProps,
    ...dispatchProps,
    ...ownProps,
    onUpdateMeasurePeriod: (startDate, endDate) =>
      // TODO: PHX-103 - Now only select the last map overlay start date and end date, will use both in PHX-103
      dispatch(
        updateMeasureConfig(currentMapOverlayCodes[currentMapOverlayCodes.length - 1], {
          startDate,
          endDate,
        }),
      ),
    onSelectMapOverlay,
    onUnSelectMapOverlay,
  };
};

export const MapOverlayBar = connect(
  mapStateToProps,
  mapDispatchToProps,
  mergeProps,
)(MapOverlayBarComponent);
