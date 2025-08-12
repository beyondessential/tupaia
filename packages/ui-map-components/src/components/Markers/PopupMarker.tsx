import React from 'react';
import Typography from '@material-ui/core/Typography';
import styled from 'styled-components';
import { Popup } from 'react-leaflet';
import { MeasureData } from '../../types';

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

interface PopupMarkerProps {
  coordinates: MeasureData['coordinates'];
  headerText: string;
  buttonText?: string;
  children?: React.ReactNode;
  onDetailButtonClick?: () => void;
  onOpen?: () => void;
  onClose?: () => void;
  popupRef?: React.Ref<any>;
  sidePanelWidth?: number;
}

export const PopupMarker = React.memo(
  ({
    onDetailButtonClick,
    onOpen = () => {},
    onClose = () => {},
    sidePanelWidth = 0,
    buttonText,
    headerText,
    coordinates,
    children,
    popupRef,
  }: PopupMarkerProps) => {
    const displayCoordinates = (coordinates as number[])?.map((c: any) => c.toFixed(5)).join(', ');
    /*
     * This is a workaround for a bug in react-leaflet where the onOpen and onClose callbacks cause a
     * re-mount of the Popup component which causes the popup to close unexpectedly on map re-renders
     * @see https://github.com/PaulLeCam/react-leaflet/issues/895
     * */
    const onOpenCallback = React.useMemo(() => onOpen, []);
    const onCloseCallback = React.useMemo(() => onClose, []);
    return (
      <StyledPopup
        pane="popupPane"
        autoPanPaddingTopLeft={[0, TOP_BAR_HEIGHT]}
        autoPanPaddingBottomRight={[sidePanelWidth, TOP_BAR_HEIGHT]}
        minWidth={300}
        maxWidth={300}
        onOpen={onOpenCallback}
        onClose={onCloseCallback}
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
