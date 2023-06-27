/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import { useParams } from 'react-router-dom';
import { PolygonLayer } from './PolygonLayer';
import { EntityResponse } from '../../types';
import { useEntitiesWithLocation } from '../../api/queries';

export const MapOverlays = () => {
  const { projectCode, entityCode } = useParams();
  const { data: entityData } = useEntitiesWithLocation(projectCode, entityCode);

  return <PolygonLayer entityData={entityData as EntityResponse} />;
};
