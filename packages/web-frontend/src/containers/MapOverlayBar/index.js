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
  selectCurrentMapOverlay,
  selectCurrentProject,
  selectMapOverlayByCode,
} from '../../selectors';

export class MapOverlayBar extends Component {
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

    this.props.onSelectMapOverlay(mapOverlay);
  };

  renderDefaultMeasure() {
    const { currentMapOverlayCode, defaultMapOverlay } = this.props;

    return (
      <HierarchyItem
        nestedMargin="0px"
        label={defaultMapOverlay.name}
        isSelected={currentMapOverlayCode === defaultMapOverlay.mapOverlayCode}
        onClick={() => this.handleSelectMapOverlay(defaultMapOverlay)}
      />
    );
  }

  renderNestedHierarchyItems(children) {
    const { currentMapOverlayCode, onClearMeasure } = this.props;
    return children.map(childObject => {
      let nestedItems;

      if (childObject.children && childObject.children.length) {
        nestedItems = this.renderNestedHierarchyItems(childObject.children);
      }

      let onClick = null;

      if (!childObject.children) {
        onClick =
          currentMapOverlayCode === childObject.mapOverlayCode
            ? () => onClearMeasure()
            : () => this.handleSelectMapOverlay(childObject);
      }

      return (
        <HierarchyItem
          label={childObject.name}
          info={childObject.info}
          isSelected={
            childObject.children ? null : currentMapOverlayCode === childObject.mapOverlayCode
          }
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
        {defaultMapOverlay?.mapOverlayCode ? this.renderDefaultMeasure() : null}
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
      currentMapOverlay,
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
        selectedMapOverlay={currentMapOverlay}
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

MapOverlayBar.propTypes = {
  currentMapOverlayCode: PropTypes.string,
  currentMapOverlay: MapOverlayShape,
  mapOverlayHierarchy: PropTypes.array.isRequired,
  isExpanded: PropTypes.bool.isRequired,
  isMeasureLoading: PropTypes.bool.isRequired,
  onSelectMapOverlay: PropTypes.func.isRequired,
  onClearMeasure: PropTypes.func.isRequired,
  onUpdateMeasurePeriod: PropTypes.func.isRequired,
  currentOrganisationUnitName: PropTypes.string,
  defaultMapOverlay: MapOverlayShape,
};

MapOverlayBar.defaultProps = {
  currentMapOverlayCode: '',
  currentOrganisationUnitName: '',
  defaultMapOverlay: {},
  currentMapOverlay: {},
};

const mapStateToProps = state => {
  const { mapOverlayHierarchy, isExpanded } = state.mapOverlayBar;
  const { isMeasureLoading } = state.map;
  const { isLoadingOrganisationUnit } = state.global;

  const currentOrganisationUnit = selectCurrentOrgUnit(state);
  const currentMapOverlay = selectCurrentMapOverlay(state);

  const currentMapOverlayCode = currentMapOverlay?.mapOverlayCode;
  // TODO: current measures in Measure Bar
  // const currentMeasures = selectCurrentMeasures(state);
  const activeProject = selectCurrentProject(state);

  const defaultMapOverlay = selectMapOverlayByCode(state, activeProject.defaultMeasure);

  return {
    currentMapOverlay,
    currentMapOverlayCode,
    mapOverlayHierarchy,
    isExpanded,
    currentOrganisationUnitName: currentOrganisationUnit.name,
    isMeasureLoading: isMeasureLoading || isLoadingOrganisationUnit,
    defaultMapOverlay,
  };
};

const mapDispatchToProps = dispatch => ({
  onExpandClick: () => dispatch(toggleMeasureExpand()),
  onClearMeasure: () => dispatch(clearMeasure()),
  onSelectMapOverlay: mapOverlay => dispatch(setMapOverlay(mapOverlay.mapOverlayCode)),
  dispatch,
});

const mergeProps = (stateProps, dispatchProps, ownProps) => {
  const { dispatch } = dispatchProps;
  const { currentMapOverlayCode } = stateProps;

  return {
    ...stateProps,
    ...dispatchProps,
    ...ownProps,
    onUpdateMeasurePeriod: (startDate, endDate) =>
      dispatch(updateMeasureConfig(currentMapOverlayCode, { startDate, endDate })),
  };
};

export default connect(mapStateToProps, mapDispatchToProps, mergeProps)(MapOverlayBar);
