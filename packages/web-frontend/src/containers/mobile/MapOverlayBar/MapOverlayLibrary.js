/**
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { connect } from 'react-redux';
import shallowEqual from 'shallowequal';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import Button from '@material-ui/core/Button';

import { setMapOverlays, clearMeasure } from '../../../actions';
import { HierarchyItem } from '../../../components/HierarchyItem';
import { selectCurrentMapOverlays } from '../../../selectors';
import { MAP_OVERLAY_SELECTOR, LEAFLET_Z_INDEX } from '../../../styles';

const LibraryContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: ${LEAFLET_Z_INDEX + 1};
  background: black;
`;

const LibraryContent = styled.div`
  padding: 10px 24px;
`;

const LibraryHeader = styled(Button)`
  background: ${MAP_OVERLAY_SELECTOR.subBackground};
  border-radius: 0;
  width: 100%;
  text-transform: none;
  font-size: 18px;
  font-weight: 500;
  padding: 16px;
`;

const BackIcon = styled(ArrowBackIcon)`
  position: absolute;
  left: 22px;
`;

const MapOverlayLibraryComponent = ({
  currentMapOverlay,
  mapOverlayHierarchy,
  onSetMapOverlay,
  onClearMapOverlay,
  onClose,
}) => {
  const handleSelectMapOverlay = ({ mapOverlayCode }, isSelected) => {
    if (isSelected) {
      onClearMapOverlay();
    } else {
      onSetMapOverlay(mapOverlayCode);
    }
  };

  const renderNestedHierarchyItems = children =>
    children.map(childObject => {
      let nestedItems;
      if (childObject.children && childObject.children.length) {
        nestedItems = renderNestedHierarchyItems(childObject.children);
      }

      const isSelected = childObject.children
        ? null
        : currentMapOverlay.mapOverlayCode === childObject.mapOverlayCode;

      let onClick = null;
      if (!childObject.children) {
        onClick = () => {
          handleSelectMapOverlay(childObject, isSelected);
          onClose();
        };
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

    return items.length > 0 ? items : null;
  };

  return (
    <LibraryContainer>
      <LibraryHeader onClick={onClose}>
        <BackIcon />
        Overlay Library
      </LibraryHeader>
      <LibraryContent>{renderHierarchy()}</LibraryContent>
    </LibraryContainer>
  );
};

const MapOverlayShape = PropTypes.shape({
  mapOverlayCode: PropTypes.string,
  name: PropTypes.string,
  periodGranularity: PropTypes.string,
  datePickerLimits: PropTypes.string,
  isTimePeriodEditable: PropTypes.string,
});

MapOverlayLibraryComponent.propTypes = {
  currentMapOverlay: MapOverlayShape,
  mapOverlayHierarchy: PropTypes.array.isRequired,
  onSetMapOverlay: PropTypes.func.isRequired,
  onClearMapOverlay: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

MapOverlayLibraryComponent.defaultProps = {
  currentMapOverlay: null,
};

const mapStateToProps = state => {
  const { mapOverlayHierarchy } = state.mapOverlayBar;

  const currentMapOverlays = selectCurrentMapOverlays(state);
  const currentMapOverlay = currentMapOverlays.length > 0 ? currentMapOverlays[0] : null;

  return {
    currentMapOverlay,
    mapOverlayHierarchy,
  };
};

const mapDispatchToProps = dispatch => ({
  onSetMapOverlay: mapOverlayCode => dispatch(setMapOverlays(mapOverlayCode)),
  onClearMapOverlay: () => dispatch(clearMeasure()),
});

function shouldComponentUpdate(prevProps, nextProps) {
  const propsAreUnchanged = shallowEqual(prevProps, nextProps);
  if (propsAreUnchanged) return true;
  return false;
}

export const MapOverlayLibrary = connect(
  mapStateToProps,
  mapDispatchToProps,
)(React.memo(MapOverlayLibraryComponent, shouldComponentUpdate));
