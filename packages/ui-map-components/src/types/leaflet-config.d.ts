import { Layer as LeafletLayer, LayerOptions as LeafletLayerOptions } from 'leaflet';

/**
 * Overrides to leaflet types to handle anything not covered by the built in types
 */
declare module 'leaflet' {
  export interface LayerOptions extends LeafletLayerOptions {
    direction?: string;
  }

  export interface Layer extends LeafletLayer {
    update: () => void;
  }
}
