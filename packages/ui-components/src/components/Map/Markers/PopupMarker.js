/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Popup } from 'react-leaflet';

const TOP_BAR_HEIGHT = 60; // is this needed?

const Heading = styled.h2`
  margin: 0;
  font-size: 20px;
  font-weight: bold;
`;

const Content = styled.div`
  font-size: 16px;
  text-align: center;
`;

const ContentItem = styled.div`
  margin: 0 0 20px 0;
`;

const Button = styled.button`
  background: white;
  border-radius: 2;
  border: 0;
  text-transform: uppercase;
  font-weight: bold;
  padding: 8px 15px;
  font-size: 14;
  outline: 0;
  cursor: pointer;
`;

export const PopupMarker = ({
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
    <Popup
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
        <Heading>{headerText}</Heading>
        {coordinates && <ContentItem>({displayCoordinates})</ContentItem>}
        <ContentItem>{children}</ContentItem>
        {onDetailButtonClick && buttonText && (
          <Button type="button" onClick={onDetailButtonClick}>
            {buttonText}
          </Button>
        )}
      </Content>
    </Popup>
  );
};

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
  onDetailButtonClick: () => null,
  sidePanelWidth: 0,
  coordinates: null,
  children: null,
  buttonText: null,
};
