import { MapContainerProps as ReactLeafletMapContainerProps } from 'react-leaflet';

declare module 'react-leaflet' {
  export interface MapContainerProps extends ReactLeafletMapContainerProps {
    onClick?: (event: any) => void;
  }
}
