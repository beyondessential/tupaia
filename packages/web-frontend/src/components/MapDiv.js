/**
 * Tupaia Web
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */

/**
 * MapDiv
 *
 * Visual flex arranged div used for laying out the map controls on the screen such as SearchBar,
 * LocationBar, UserBar the map controls. Probably a custom attribution as well.
 */
import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Legend as MapLegend, TilePicker, tileSetShape } from '@tupaia/ui-components';
import { CONTROL_BAR_PADDING } from '../styles';
import { MapOverlayBar } from '../containers/MapOverlayBar';
import { MapWatermark } from './MapWatermark';
import { selectActiveTileSet, selectCurrentMapOverlayCodes, selectTileSets } from '../selectors';
import { changeTileSet } from '../actions';

const FlexDiv = styled.div`
  flex: 1;
  display: flex;
`;

const LeftCol = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
`;

const TopRow = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  padding: ${CONTROL_BAR_PADDING}px;
`;

const BottomRow = styled.div`
  display: content;
  flex-direction: row;
  align-items: flex-end;
  justify-content: center;
`;

const Watermark = styled(MapWatermark)`
  margin-left: 2px;
  margin-bottom: 16px;
`;

export const MapDivComponent = ({
  tileSets,
  activeTileSet,
  onChangeTileSet,
  hiddenValues,
  setValueHidden,
  measureInfo,
  isMeasureLoading,
  currentMapOverlayCodes,
  displayedMapOverlayCodes,
}) => (
  <FlexDiv>
    <LeftCol>
      <TopRow>
        <MapOverlayBar />
      </TopRow>
      <BottomRow>
        {!isMeasureLoading && (
          <MapLegend
            setValueHidden={setValueHidden}
            hiddenValues={hiddenValues}
            measureInfo={measureInfo}
            currentMapOverlayCodes={currentMapOverlayCodes}
            displayedMapOverlayCodes={displayedMapOverlayCodes}
            seriesesKey="measureOptions"
          />
        )}
      </BottomRow>
    </LeftCol>
    <TilePicker tileSets={tileSets} activeTileSet={activeTileSet} onChange={onChangeTileSet} />
    <Watermark />
  </FlexDiv>
);

MapDivComponent.propTypes = {
  activeTileSet: PropTypes.shape(tileSetShape).isRequired,
  tileSets: PropTypes.arrayOf(PropTypes.shape(tileSetShape)).isRequired,
  measureInfo: PropTypes.object.isRequired,
  isMeasureLoading: PropTypes.bool.isRequired,
  onChangeTileSet: PropTypes.func.isRequired,
  setValueHidden: PropTypes.func.isRequired,
  hiddenValues: PropTypes.object.isRequired,
  displayedMapOverlayCodes: PropTypes.arrayOf(PropTypes.string).isRequired,
  currentMapOverlayCodes: PropTypes.arrayOf(PropTypes.string).isRequired,
};

MapDivComponent.defaultProps = {};

const mapStateToProps = state => {
  return {
    activeTileSet: selectActiveTileSet(state),
    hiddenValues: state.map.hiddenMeasures,
    measureInfo: state.map.measureInfo,
    isMeasureLoading: state.map.isMeasureLoading,
    tileSets: selectTileSets(state),
    currentMapOverlayCodes: selectCurrentMapOverlayCodes(state),
    displayedMapOverlayCodes: state.map.displayedMapOverlays,
  };
};

const mapDispatchToProps = dispatch => ({
  onChangeTileSet: setKey => dispatch(changeTileSet(setKey)),
  setValueHidden: (key, value, hide) =>
    dispatch({
      key,
      value,
      type: hide ? 'HIDE_MAP_MEASURE' : 'UNHIDE_MAP_MEASURE',
    }),
});

export const MapDiv = connect(mapStateToProps, mapDispatchToProps)(MapDivComponent);
