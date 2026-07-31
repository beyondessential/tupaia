export {
  Polygon as BasePolygon,
  TileLayer as BaseTileLayer,
  ZoomControl,
  MapContainer as LeafletMapContainer,
  LayerGroup,
  GeoJSON,
  Polygon,
} from 'react-leaflet';
export type { GeoJSONProps } from 'react-leaflet';
export * from './ActivePolygon';
export * from './AreaTooltip';
export * from './Legend';
export * from './LeafletMap';
export * from './Markers';
export * from './PopupDataItemList';
// Table (MapTable) is deliberately not re-exported here: it depends on xlsx (~2 MB) via
// DataTable, which would be retained in every consumer's bundle. Import it from
// '@tupaia/ui-map-components/dist/components/Table'.
export * from './TileLayer';
export * from './TilePicker';
