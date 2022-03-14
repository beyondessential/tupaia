/**
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { connect } from 'react-redux';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import ExpandLessIcon from '@material-ui/icons/ExpandLess';
import CloseIcon from '@material-ui/icons/Close';
import { Legend } from '@tupaia/ui-components/lib/map';
import { selectCurrentMapOverlayCodes } from '../../selectors';
import { LEAFLET_Z_INDEX, MOBILE_BACKGROUND_COLOR } from '../../styles';

const BottomRight = styled.div`
  position: absolute;
  bottom: 0;
  padding: 10px;
  width: calc(100vw - 20px);
  z-index: ${LEAFLET_Z_INDEX + 1};
  display: flex;
  justify-content: flex-end;
`;

const CollapsedContainer = styled(Button)`
  border-radius: 5px;
  background: ${MOBILE_BACKGROUND_COLOR};
  text-transform: none;
  font-size: 11px;
  font-weight: 500;
  padding: 4px 14px 4px 8px;

  &.MuiButton-root:hover {
    background-color: ${MOBILE_BACKGROUND_COLOR};
  }
`;

const CollapsedIconContainer = styled.div`
  font-size: 28px;
  display: flex;
  margin-right: 4px;
`;

const CollapsedIcon = styled(ExpandLessIcon)`
  margin: auto;
`;

const LegendContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  min-height: 50px;
  border-radius: 5px;
  background: ${MOBILE_BACKGROUND_COLOR};
  position: relative;
  padding-top: 4px;
`;

const SeriesContainer = styled.div`
  padding: 0.6rem 1rem;
  margin: auto 0;
  color: white;
`;

const SeriesDivider = styled.div`
  height: 0px;
  border: 1px solid white;
  width: 90%;
  margin: auto;
`;

const CloseButton = styled(IconButton)`
  position: absolute;
  top: 8px;
  right: 8px;
  padding: 0;
  font-size: 21px;
`;

export const MapOverlayLegendComponent = ({
  measureInfo,
  hiddenValues,
  setValueHidden,
  currentMapOverlayCodes,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (
    currentMapOverlayCodes.length === 0 ||
    currentMapOverlayCodes.some(code => !measureInfo[code])
  ) {
    return null;
  }

  return (
    <BottomRight>
      {!isExpanded && (
        <CollapsedContainer onClick={() => setIsExpanded(true)}>
          <CollapsedIconContainer>
            <CollapsedIcon fontSize="inherit" />
          </CollapsedIconContainer>
          Map Legend
        </CollapsedContainer>
      )}
      {isExpanded && (
        <LegendContainer>
          <Legend
            setValueHidden={setValueHidden}
            hiddenValues={hiddenValues}
            measureInfo={measureInfo}
            currentMapOverlayCodes={currentMapOverlayCodes}
            seriesesKey="measureOptions"
            SeriesContainer={SeriesContainer}
            SeriesDivider={SeriesDivider}
          />
          <CloseButton onClick={() => setIsExpanded(false)}>
            <CloseIcon fontSize="inherit" />
          </CloseButton>
        </LegendContainer>
      )}
    </BottomRight>
  );
};

MapOverlayLegendComponent.propTypes = {
  measureInfo: PropTypes.object.isRequired,
  setValueHidden: PropTypes.func.isRequired,
  hiddenValues: PropTypes.object.isRequired,
  currentMapOverlayCodes: PropTypes.arrayOf(PropTypes.string).isRequired,
};

const mapStateToProps = state => {
  return {
    hiddenValues: state.map.hiddenMeasures,
    measureInfo: state.map.measureInfo,
    currentMapOverlayCodes: selectCurrentMapOverlayCodes(state),
  };
};

const mapDispatchToProps = dispatch => ({
  setValueHidden: (key, value, hide) =>
    dispatch({
      key,
      value,
      type: hide ? 'HIDE_MAP_MEASURE' : 'UNHIDE_MAP_MEASURE',
    }),
});

export const MapOverlayLegend = connect(
  mapStateToProps,
  mapDispatchToProps,
)(MapOverlayLegendComponent);
