import { LatLngBoundsExpression, LatLngExpression } from 'leaflet';
import { KeysToCamelCase } from '@tupaia/types';

// re-type the coordinates to be what the ui-map-components expect, because in the types package they are any | null
export type Entity = KeysToCamelCase<Omit<TupaiaWebEntityRequest.ResBody, 'region' | 'bounds'>> & {
  region?: LatLngBoundsExpression;
  point?: LatLngExpression;
  bounds?: LatLngBoundsExpression;
  parentCode: Entity['code'];
  childCodes: Entity['code'][];
  photoUrl?: string;
  children?: Entity[];
};

export type EntityCode = Entity['code'];
