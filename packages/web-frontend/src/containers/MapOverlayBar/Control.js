import React, { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import LayersIcon from '@material-ui/icons/Layers';
import Fade from '@material-ui/core/Fade';
import LastUpdated from './LastUpdated';
import { CONTROL_BAR_WIDTH, TUPAIA_ORANGE } from '../../styles';
import { Content, ContentText } from './Styles';
import { MapTableModal } from '../MapTableModal';
import { TitleAndDatePicker } from './TitleAndDatePicker';

const Container = styled.div`
  width: ${CONTROL_BAR_WIDTH}px;
  cursor: auto;
  min-height: 0; /* firefox vertical scroll */
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const Header = styled.div`
  display: flex;
  font-weight: 500;
  pointer-events: auto;
  background: ${TUPAIA_ORANGE};
  color: #ffffff;
  text-transform: uppercase;
  border-top-left-radius: 5px;
  border-top-right-radius: 5px;
  padding: 2px 15px 0;
  height: 40px;
  font-size: 0.75rem;
  align-items: center;

  .MuiSvgIcon-root {
    font-size: 21px;
    margin-right: 5px;
  }
`;

const EmptyContentText = styled(ContentText)`
  font-size: 16px;
  padding-right: 6px;
`;

const SubHeader = styled.div`
  color: ${TUPAIA_ORANGE};
  font-size: 12px;
  font-weight: 500;
  padding: 4px;
  text-transform: uppercase;
  margin-bottom: 10px;
`;

const ExpandedContent = styled.div`
  pointer-events: auto;
  background: #203e5c;
  border-top: 1px solid rgba(255, 255, 255, 0.25);
  color: #fff;
  border-bottom-left-radius: 5px;
  border-bottom-right-radius: 5px;
  overflow-y: auto;
  padding: 15px;
  flex-basis: 0;
  flex-grow: 1;
`;

export const Control = ({
  emptyMessage,
  selectedMapOverlays,
  isMeasureLoading,
  onUpdateMeasurePeriod,
  children,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const isMeasureSelected = selectedMapOverlays.length > 0;
  const toggleMeasures = useCallback(() => {
    if (isExpanded) {
      setIsExpanded(false);
    } else {
      setIsExpanded(true);
    }
  }, [isExpanded, setIsExpanded]);

  return (
    <Container>
      <Header>
        <LayersIcon />
        Map overlays
        <MapTableModal />
      </Header>
      {isMeasureSelected ? (
        selectedMapOverlays.map((mapOverlay, index) => (
          <TitleAndDatePicker
            key={mapOverlay.mapOverlayId}
            mapOverlay={mapOverlay}
            onUpdateMeasurePeriod={onUpdateMeasurePeriod}
            isExpanded={isExpanded}
            isMeasureSelected={isMeasureSelected}
            toggleMeasures={toggleMeasures}
            isMeasureLoading={isMeasureLoading}
            showDatePickerOnlyAfterSecondTitle={
              selectedMapOverlays.length === 2 ? index === 1 : true
            }
          />
        ))
      ) : (
        <Content>
          <EmptyContentText>{emptyMessage}</EmptyContentText>
        </Content>
      )}
      <Fade in={isExpanded} mountOnEnter unmountOnExit exit={false}>
        <ExpandedContent>
          <SubHeader>Select an overlay</SubHeader>
          {children}
        </ExpandedContent>
      </Fade>
      <LastUpdated />
    </Container>
  );
};

Control.propTypes = {
  selectedMapOverlays: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string,
      periodGranularity: PropTypes.string,
      isTimePeriodEditable: PropTypes.bool,
      datePickerLimits: PropTypes.shape({
        startDate: PropTypes.object,
        endDate: PropTypes.object,
      }),
      startDate: PropTypes.shape({}),
      endDate: PropTypes.shape({}),
    }),
  ),
  emptyMessage: PropTypes.string.isRequired,
  children: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.node), PropTypes.node]).isRequired,
  isMeasureLoading: PropTypes.bool,
  onUpdateMeasurePeriod: PropTypes.func.isRequired,
};

Control.defaultProps = {
  selectedMapOverlays: [],
  isMeasureLoading: false,
};
