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

import React, { useEffect, useState } from 'react';
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
import { MAX_MAP_OVERLAYS } from './constant';

const MapOverlayBarComponent = ({
  currentMapOverlays,
  isMeasureLoading,
  currentOrganisationUnitName,
  onUpdateMeasurePeriod,
  mapOverlayHierarchy,
  defaultMapOverlay,
  currentMapOverlayCodes,
  onSetMapOverlay,
  onClearMeasure,
}) => {
  const [hasNeverBeenChanged, setHasNeverBeenChanged] = useState(true);
  const [maxSelectedOverlays, setMaxSelectedOverlays] = useState(1);
  useEffect(() => {
    const { length } = currentMapOverlayCodes;
    if (length > MAX_MAP_OVERLAYS) {
      setMaxSelectedOverlays(MAX_MAP_OVERLAYS);
    } else {
      setMaxSelectedOverlays(length);
    }
  }, [currentMapOverlayCodes]);

  const isCheckBox = maxSelectedOverlays > 1;

  const onSelectMapOverlay = mapOverlayCode => {
    const newMapOverlayCodes = [...currentMapOverlayCodes, mapOverlayCode];
    if (newMapOverlayCodes.length > maxSelectedOverlays) {
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

  const handleSelectMapOverlay = (mapOverlay, isSelected) => {
    if (hasNeverBeenChanged) {
      setHasNeverBeenChanged(false);
    }

    if (isSelected) {
      onUnSelectMapOverlay(mapOverlay.mapOverlayCode);
    } else {
      onSelectMapOverlay(mapOverlay.mapOverlayCode);
    }
  };

  const renderDefaultMapOverlay = () => {
    if (!defaultMapOverlay) {
      return null;
    }
    const isSelected = currentMapOverlayCodes.includes(defaultMapOverlay.mapOverlayCode);

    return (
      <HierarchyItem
        nestedMargin="0px"
        label={defaultMapOverlay.name}
        isCheckBox={isCheckBox}
        isSelected={isSelected}
        onClick={() => handleSelectMapOverlay(defaultMapOverlay, isSelected)}
      />
    );
  };

  const renderNestedHierarchyItems = children =>
    children.map(childObject => {
      let nestedItems;
      if (childObject.children && childObject.children.length) {
        nestedItems = renderNestedHierarchyItems(childObject.children);
      }

      const isSelected = childObject.children
        ? null
        : currentMapOverlayCodes.includes(childObject.mapOverlayCode);

      let onClick = null;
      if (!childObject.children) {
        onClick = () => handleSelectMapOverlay(childObject, isSelected);
      }

      return (
        <HierarchyItem
          label={childObject.name}
          info={childObject.info}
          isCheckBox={isCheckBox}
          isSelected={isSelected}
          key={childObject.mapOverlayCode}
          onClick={onClick}
          nestedItems={nestedItems}
        />
      );
    });

  const renderHierarchy = () => {
    const items = mapOverlayHierarchy.map(({ name: groupName, children, info }) => {
      if (!Array.isArray(children)) return null;
      const nestedItems = renderNestedHierarchyItems(children);
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
        {defaultMapOverlay?.mapOverlayCode ? renderDefaultMapOverlay() : null}
        {items}
      </>
    );
  };

  const orgName = currentOrganisationUnitName || 'Your current selection';
  const emptyMessage = `Select an area with valid data. ${orgName} has no map overlays available.`;

  const changeMaxSelectedOverlays = selectedIndex => {
    const selectedMaxOverlays = selectedIndex + 1;
    setMaxSelectedOverlays(selectedMaxOverlays);
    if (selectedMaxOverlays < currentMapOverlayCodes.length) {
      onSetMapOverlay(currentMapOverlayCodes.slice(0, selectedMaxOverlays));
    }
  };

  return (
    <Control
      emptyMessage={emptyMessage}
      selectedMapOverlays={currentMapOverlays}
      isMeasureLoading={isMeasureLoading}
      onUpdateMeasurePeriod={onUpdateMeasurePeriod}
      maxSelectedOverlays={maxSelectedOverlays}
      changeMaxSelectedOverlays={changeMaxSelectedOverlays}
    >
      {renderHierarchy()}
    </Control>
  );
};

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
  onSetMapOverlay: PropTypes.func.isRequired,
  onClearMeasure: PropTypes.func.isRequired,
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
  const { dispatch } = dispatchProps;
  const { currentMapOverlayCodes } = stateProps;

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
  };
};

function shouldComponentUpdate(prevProps, nextProps) {
  const propsAreUnchanged = shallowEqual(prevProps, nextProps);
  if (propsAreUnchanged) return true;
  return false;
}

export const MapOverlayBar = connect(
  mapStateToProps,
  mapDispatchToProps,
  mergeProps,
)(React.memo(MapOverlayBarComponent, shouldComponentUpdate));
