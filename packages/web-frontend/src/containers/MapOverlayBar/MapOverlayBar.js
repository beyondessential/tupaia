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
  setDisplayedMapOverlays,
  setMaxSelectedOverlays,
} from '../../actions';
import { MapOverlayHierarchy } from '../../components/MapOverlayHierarchy';
import {
  selectCurrentOrgUnit,
  selectCurrentMapOverlays,
  selectCurrentMapOverlayCodes,
  selectMapOverlayEmptyMessage,
} from '../../selectors';

const pinnedOverlayCodeReducer = (currentOverlayCode, newOverlayCode) => {
  if (currentOverlayCode === newOverlayCode) {
    return null;
  }

  return newOverlayCode;
};

const MapOverlayBarComponent = ({
  currentMapOverlays,
  emptyMessage,
  hierarchyData,
  currentMapOverlayCodes,
  onSetMapOverlay,
  onSetDisplayedMapOverlays,
  onClearMeasure,
  maxSelectedOverlays,
  onSetMaxSelectedOverlays,
}) => {
  const [hasNeverBeenChanged, setHasNeverBeenChanged] = useState(true);
  const [pinnedOverlay, setPinnedOverlay] = useReducer(pinnedOverlayCodeReducer, null);
  useEffect(() => {
    const { length } = currentMapOverlayCodes;
    if (length > maxSelectedOverlays) {
      onSetMaxSelectedOverlays(length);
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
    onSetMaxSelectedOverlays(maxNumOfSelectedOverlays);
  };

  return (
    <Control
      emptyMessage={emptyMessage}
      selectedMapOverlays={currentMapOverlays}
      maxSelectedOverlays={maxSelectedOverlays}
      changeMaxSelectedOverlays={changeMaxSelectedOverlays}
      pinnedOverlay={pinnedOverlay}
      setPinnedOverlay={setPinnedOverlay}
      hasOverlays={hierarchyData.length > 0}
    >
      <MapOverlayHierarchy
        currentMapOverlayCodes={currentMapOverlayCodes}
        hierarchyData={hierarchyData}
        onSelectMapOverlay={handleSelectMapOverlay}
        isCheckBox={isCheckBox}
      />
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
  emptyMessage: PropTypes.string,
  hierarchyData: PropTypes.array.isRequired,
  maxSelectedOverlays: PropTypes.number.isRequired,
  onSetMapOverlay: PropTypes.func.isRequired,
  onClearMeasure: PropTypes.func.isRequired,
  onSetDisplayedMapOverlays: PropTypes.func.isRequired,
  onSetMaxSelectedOverlays: PropTypes.func.isRequired,
};

MapOverlayBarComponent.defaultProps = {
  currentMapOverlayCodes: [],
  currentMapOverlays: [],
  emptyMessage: null,
};

const mapStateToProps = state => {
  const { mapOverlayHierarchy } = state.mapOverlayBar;
  const { maxSelectedOverlays } = state.map;

  const currentOrganisationUnit = selectCurrentOrgUnit(state);
  const currentMapOverlays = selectCurrentMapOverlays(state);
  const currentMapOverlayCodes = selectCurrentMapOverlayCodes(state);

  return {
    currentMapOverlays,
    currentMapOverlayCodes,
    emptyMessage: selectMapOverlayEmptyMessage(state),
    hierarchyData: mapOverlayHierarchy,
    currentOrganisationUnitName: currentOrganisationUnit.name,
    maxSelectedOverlays,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    onSetMapOverlay: mapOverlayCodes => dispatch(setMapOverlays(mapOverlayCodes.join(','))),
    onSetDisplayedMapOverlays: mapOverlayCodes =>
      dispatch(setDisplayedMapOverlays(mapOverlayCodes)),
    onClearMeasure: () => dispatch(clearMeasure()),
    onSetMaxSelectedOverlays: newMaxNum => dispatch(setMaxSelectedOverlays(newMaxNum)),
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
