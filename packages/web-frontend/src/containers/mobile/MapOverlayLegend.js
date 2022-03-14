/**
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { connect } from 'react-redux';
import Button from '@material-ui/core/Button';
import ExpandLessIcon from '@material-ui/icons/ExpandLess';
import { Legend } from '@tupaia/ui-components/lib/map';
import { selectCurrentMapOverlayCodes } from '../../selectors';
import { LEAFLET_Z_INDEX } from '../../styles';

const BottomRight = styled.div`
  position: absolute;
  bottom: 0;
  right: 0;
  padding: 10px;
  z-index: ${LEAFLET_Z_INDEX + 1};
  display: flex;
  flex-direction: column;
  align-items: flex-end;
`;

const CollapsedContainer = styled(Button)`
  border-radius: 5px;
  background: black;
  text-transform: none;
  font-size: 11px;
  font-weight: 500;
  padding: 4px 14px 4px 8px;

  &.MuiButton-root:hover {
    background-color: black;
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
  margin-top: 0.2rem;
`;

export const MapOverlayLegendComponent = ({
  measureInfo,
  hiddenValues,
  setValueHidden,
  currentMapOverlayCodes,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <BottomRight>
      <CollapsedContainer onClick={() => setIsExpanded(!isExpanded)}>
        <CollapsedIconContainer>
          <CollapsedIcon fontSize="inherit" />
        </CollapsedIconContainer>
        Map Legend
      </CollapsedContainer>
      {isExpanded && (
        <LegendContainer>
          <Legend
            setValueHidden={setValueHidden}
            hiddenValues={hiddenValues}
            measureInfo={measureInfo}
            currentMapOverlayCodes={currentMapOverlayCodes}
            seriesesKey="measureOptions"
            spaceBetween="0.2rem"
          />
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
