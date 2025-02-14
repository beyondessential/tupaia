import { MapContainerProps as ReactLeafletMapContainerProps } from 'react-leaflet';

/**
 * Overrides to react-leaflet types to handle anything not covered by the built in types
 */
declare module 'react-leaflet' {
  export interface MapContainerProps extends ReactLeafletMapContainerProps {
    onClick?: (event: any) => void;
  }
}
