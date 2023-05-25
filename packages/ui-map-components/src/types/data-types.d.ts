import { PolygonProps } from 'react-leaflet';

export type Series = {
  key: string;
  name: string;
  hideFromPopup?: boolean;
  metadata: object;
  value: string | number;
  organisationUnit?: string;
  sortOrder: number;
};

export type Entity = {
  region?: PolygonProps['positions'];
  name: string;
};
