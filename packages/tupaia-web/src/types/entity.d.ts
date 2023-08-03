/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

// re-type the coordinates to be what the ui-map-components expect, because in the types package they are any | null
export type Entity = KeysToCamelCase<Omit<TupaiaWebEntityRequest.ResBody, 'region' | 'bounds'>> & {
  region?: ActivePolygonProps['coordinates'];
  bounds?: Position[];
  parentCode: Entity['code'];
  childCodes: Entity['code'][];
  photoUrl?: string;
  children?: Entity[];
};

export type EntityCode = Entity['code'];
