import React, { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import Layers from '@material-ui/icons/Layers';
import UpArrow from '@material-ui/icons/ArrowDropUp';
import DownArrow from '@material-ui/icons/ArrowDropDown';
import CircularProgress from '@material-ui/core/CircularProgress';
import { CONTROL_BAR_WIDTH, TUPAIA_ORANGE, MAP_OVERLAY_SELECTOR } from '../../styles';

const Container = styled.div`
  width: ${CONTROL_BAR_WIDTH}px;
  pointer-events: auto;
  cursor: auto;
  transition: 0.5s;
  min-height: 0; /* firefox vertical scroll */
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const Header = styled.div`
  background: ${TUPAIA_ORANGE};
  color: #ffffff;
  text-transform: uppercase;
  border-top-left-radius: 5px;
  border-top-right-radius: 5px;
  padding: 8px;
  font-size: 0.75rem;
  display: flex;
  align-items: center;
`;

const Content = styled.div`
  background: ${MAP_OVERLAY_SELECTOR.background};
  color: #fff;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom-left-radius: ${props => (!props.expanded ? '5px' : '0px')};
  border-bottom-right-radius: ${props => (!props.expanded ? '5px' : '0px')};

  svg {
    margin: 8px;
    border-left: 1px solid white;
    padding-left: 3px;
  }
`;

const ContentText = styled.div`
  padding: 8px;
`;

const SubHeader = styled.div`
  color: ${TUPAIA_ORANGE};
  font-size: 0.7rem;
  font-weight: 400;
  padding: 4px;
  text-transform: uppercase;
`;

const ExpandedContent = styled.div`
  background: #203e5c;
  color: #fff;
  padding: 8px;
  border-bottom-left-radius: 5px;
  border-bottom-right-radius: 5px;
  flex-grow: 1;
  flex-basis: 0;
  overflow-y: scroll;
`;
// const DatePicker = styled.div``;

const ExpansionControl = ({ isExpanded, toggleMeasures }) =>
  isExpanded ? (
    <UpArrow onClick={toggleMeasures} fontSize="large" />
  ) : (
    <DownArrow onClick={toggleMeasures} fontSize="large" />
  );

export const Control = ({ emptyMessage, selectedOverlayName, isMeasureLoading, children }) => {
  const measureText = selectedOverlayName || emptyMessage;
  const [isExpanded, handleExpansion] = useState(false);
  const toggleMeasures = useCallback(() => handleExpansion(!isExpanded), [isExpanded]);

  return (
    <Container>
      <Header>
        <Layers />
        &nbsp; Map overlays &nbsp;
        {isMeasureLoading && <CircularProgress />}
      </Header>
      <Content expanded={isExpanded}>
        <ContentText>{measureText}</ContentText>
        {selectedOverlayName && (
          <ExpansionControl isExpanded={isExpanded} toggleMeasures={toggleMeasures} />
        )}
      </Content>
      {isExpanded && (
        <ExpandedContent>
          <SubHeader>Select a measure</SubHeader>
          {children}
        </ExpandedContent>
      )}
    </Container>
  );
};

ExpansionControl.propTypes = {
  isExpanded: PropTypes.func.isRequired,
  toggleMeasures: PropTypes.func.isRequired,
};

Control.propTypes = {
  selectedOverlayName: PropTypes.string.isRequired,
  emptyMessage: PropTypes.string.isRequired,
  children: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.node), PropTypes.node]).isRequired,
  isMeasureLoading: PropTypes.bool,
};

Control.defaultProps = {
  isMeasureLoading: false,
};
