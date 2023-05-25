import { Layer as LeafletLayer, LayerOptions as LeafletLayerOptions } from 'leaflet';

declare module 'leaflet' {
  export interface LayerOptions extends LeafletLayerOptions {
    direction?: string;
  }

  export interface Layer extends LeafletLayer {
    update: () => void;
  }
}
