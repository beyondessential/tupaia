/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
import Typography from '@material-ui/core/Typography';
import styled from 'styled-components';
import { Popup } from 'react-leaflet';

const TOP_BAR_HEIGHT = 60;
const DARK_BACKGROUND_COLOR = 'rgb(43,45,56)';
const LIGHT_BACKGROUND_COLOR = '#F9F9F9';

const StyledPopup = styled(Popup)`
  .leaflet-popup-content-wrapper {
    background: ${({ theme }) =>
      theme.palette.type === 'light' ? LIGHT_BACKGROUND_COLOR : DARK_BACKGROUND_COLOR};
    color: ${({ theme }) =>
      theme.palette.type === 'light' ? theme.palette.text.primary : 'white'};
    border-radius: 3px;
    padding-top: 0.5rem;
    border: none;
  }

  .leaflet-popup-tip {
    border-color: ${({ theme }) =>
      theme.palette.type === 'light' ? LIGHT_BACKGROUND_COLOR : DARK_BACKGROUND_COLOR};
    background-color: ${({ theme }) =>
      theme.palette.type === 'light' ? LIGHT_BACKGROUND_COLOR : DARK_BACKGROUND_COLOR};
  }
`;

const Heading = styled(Typography)`
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
`;

const Content = styled.div`
  font-size: 1rem;
  text-align: center;
`;

const ContentItem = styled.div`
  margin: 0 0 1.25rem 0;
`;

const Button = styled.button`
  background: white;
  border-radius: 2px;
  border: 0;
  text-transform: uppercase;
  font-weight: 600;
  padding: 0.5rem 0.9375rem;
  font-size: 0.875rem;
  outline: 0;
  cursor: pointer;
`;

export const PopupMarker = React.memo(
  ({
    onDetailButtonClick,
    onOpen,
    onClose,
    sidePanelWidth,
    buttonText,
    headerText,
    coordinates,
    children,
    popupRef,
  }) => {
    const displayCoordinates = coordinates.map(c => c.toFixed(5)).join(', ');
    return (
      <StyledPopup
        pane="popupPane"
        autoPanPaddingTopLeft={[0, TOP_BAR_HEIGHT]}
        autoPanPaddingBottomRight={[sidePanelWidth, TOP_BAR_HEIGHT]}
        minWidth={300}
        maxWidth={300}
        onOpen={onOpen}
        onClose={onClose}
        ref={popupRef}
      >
        <Content>
          <Heading variant="h2">{headerText}</Heading>
          {coordinates && <ContentItem>({displayCoordinates})</ContentItem>}
          <ContentItem>{children}</ContentItem>
          {onDetailButtonClick && buttonText && (
            <Button type="button" onClick={onDetailButtonClick}>
              {buttonText}
            </Button>
          )}
        </Content>
      </StyledPopup>
    );
  },
);

PopupMarker.propTypes = {
  coordinates: PropTypes.arrayOf(PropTypes.number),
  headerText: PropTypes.string.isRequired,
  buttonText: PropTypes.string,
  children: PropTypes.node,
  onDetailButtonClick: PropTypes.func,
  onOpen: PropTypes.func,
  onClose: PropTypes.func,
  popupRef: PropTypes.func,
  sidePanelWidth: PropTypes.number,
};

PopupMarker.defaultProps = {
  onOpen: () => null,
  onClose: () => null,
  popupRef: () => null,
  onDetailButtonClick: null,
  sidePanelWidth: 0,
  coordinates: null,
  children: null,
  buttonText: null,
};
