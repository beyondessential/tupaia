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

import React, { useEffect, useReducer, useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import shallowEqual from 'shallowequal';

import { Control } from './Control';
import {
  setMapOverlays,
  clearMeasure,
  toggleMeasureExpand,
  setDisplayedMapOverlays,
} from '../../actions';
import { HierarchyItem } from '../../components/HierarchyItem';
import {
  selectCurrentOrgUnit,
  selectCurrentMapOverlays,
  selectCurrentMapOverlayCodes,
  selectCurrentProject,
  selectMapOverlayByCode,
} from '../../selectors';

const pinnedOverlayCodeReducer = (currentOverlayCode, newOverlayCode) => {
  if (currentOverlayCode === newOverlayCode) {
    return null;
  }

  return newOverlayCode;
};

const MapOverlayBarComponent = ({
  currentMapOverlays,
  currentOrganisationUnitName,
  mapOverlayHierarchy,
  defaultMapOverlay,
  currentMapOverlayCodes,
  onSetMapOverlay,
  onSetDisplayedMapOverlays,
  onClearMeasure,
}) => {
  const [hasNeverBeenChanged, setHasNeverBeenChanged] = useState(true);
  const [maxSelectedOverlays, setMaxSelectedOverlays] = useState(1);
  const [pinnedOverlay, setPinnedOverlay] = useReducer(pinnedOverlayCodeReducer, null);
  useEffect(() => {
    const { length } = currentMapOverlayCodes;
    if (length > maxSelectedOverlays) {
      setMaxSelectedOverlays(length);
    }
    if (!currentMapOverlayCodes.includes(pinnedOverlay)) {
      setPinnedOverlay(null);
    }
  }, [currentMapOverlayCodes]);
  useEffect(() => {
    if (maxSelectedOverlays === 1) {
      setPinnedOverlay(null);
      onSetDisplayedMapOverlays(currentMapOverlayCodes);
    }
    if (maxSelectedOverlays < currentMapOverlayCodes.length) {
      onSetMapOverlay(currentMapOverlayCodes.slice(0, maxSelectedOverlays));
    }
  }, [maxSelectedOverlays]);

  const isCheckBox = maxSelectedOverlays > 1;

  const onSelectMapOverlay = mapOverlayCode => {
    const newMapOverlayCodes = [...currentMapOverlayCodes, mapOverlayCode];

    const shiftOverlayCodes = mapOverlayCodes => {
      // Pinned map overlay should be always selected.
      const results = mapOverlayCodes.filter(code => code !== pinnedOverlay);
      results.shift();
      if (pinnedOverlay) {
        results.unshift(pinnedOverlay);
      }

      return results;
    };

    const shiftedOverlayCodes =
      newMapOverlayCodes.length > maxSelectedOverlays
        ? shiftOverlayCodes(newMapOverlayCodes)
        : newMapOverlayCodes;

    onSetMapOverlay(shiftedOverlayCodes);
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

  const changeMaxSelectedOverlays = selectedIndex => {
    const maxNumOfSelectedOverlays = selectedIndex + 1;
    setMaxSelectedOverlays(maxNumOfSelectedOverlays);
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

    if (items.length === 0) return null;

    return (
      <>
        {defaultMapOverlay?.mapOverlayCode ? renderDefaultMapOverlay() : null}
        {items}
      </>
    );
  };

  const orgName = currentOrganisationUnitName || 'Your current selection';
  const emptyMessage = `Select an area with valid data. ${orgName} has no map overlays available.`;

  return (
    <Control
      emptyMessage={emptyMessage}
      selectedMapOverlays={currentMapOverlays}
      maxSelectedOverlays={maxSelectedOverlays}
      changeMaxSelectedOverlays={changeMaxSelectedOverlays}
      pinnedOverlay={pinnedOverlay}
      setPinnedOverlay={setPinnedOverlay}
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
  onSetMapOverlay: PropTypes.func.isRequired,
  onClearMeasure: PropTypes.func.isRequired,
  onSetDisplayedMapOverlays: PropTypes.func.isRequired,
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

  const currentOrganisationUnit = selectCurrentOrgUnit(state);
  const currentMapOverlays = selectCurrentMapOverlays(state);
  const currentMapOverlayCodes = selectCurrentMapOverlayCodes(state);
  const activeProject = selectCurrentProject(state);

  const defaultMapOverlay = selectMapOverlayByCode(state, activeProject.defaultMeasure);

  return {
    currentMapOverlays,
    currentMapOverlayCodes,
    mapOverlayHierarchy,
    isExpanded,
    currentOrganisationUnitName: currentOrganisationUnit.name,
    defaultMapOverlay,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    onExpandClick: () => dispatch(toggleMeasureExpand()),
    onSetMapOverlay: mapOverlayCodes => dispatch(setMapOverlays(mapOverlayCodes.join(','))),
    onSetDisplayedMapOverlays: mapOverlayCodes =>
      dispatch(setDisplayedMapOverlays(mapOverlayCodes)),
    onClearMeasure: () => dispatch(clearMeasure()),
    dispatch,
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
)(React.memo(MapOverlayBarComponent, shouldComponentUpdate));
