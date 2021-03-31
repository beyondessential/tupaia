/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */
import React from 'react';
import { Polygon } from './Polygon';

export const PolygonLayer = ({ data }) => {
  if (!data) return null;

  return data.countryHierarchy
    ?.filter(item => item?.location?.region)
    .map(orgUnit => <Polygon key={`${orgUnit.type}-${orgUnit.name}`} orgUnit={orgUnit} />);
};
