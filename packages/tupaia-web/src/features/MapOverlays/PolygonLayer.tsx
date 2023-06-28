/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { ActivePolygon } from '@tupaia/ui-map-components';
import { useParams } from 'react-router-dom';
import { EntityResponse } from '../../types';
import { InteractivePolygon } from './InteractivePolygon';
import { useEntitiesWithLocation } from '../../api/queries';

const ChildEntities = ({ entities }: { entities: EntityResponse['children'] }) => {
  if (!entities || entities.length === 0) {
    return null;
  }
  return (
    <>
      {entities.map(entity => (
        <InteractivePolygon key={entity.code} entity={entity} isChildArea />
      ))}
    </>
  );
};

const SiblingEntities = ({ entity }: { entity: EntityResponse }) => {
  const { projectCode } = useParams();
  const { data: siblingEntities, isLoading } = useEntitiesWithLocation(
    projectCode,
    entity.parentCode,
  );

  if (isLoading || !siblingEntities) {
    return null;
  }

  const children = siblingEntities?.children?.filter(e => e.code !== entity.code) || [];

  return (
    <>
      {children.map(entity => (
        <InteractivePolygon key={entity.code} entity={entity} />
      ))}
    </>
  );
};

const ActiveEntity = ({ entity }: { entity: EntityResponse }) => {
  const { region, children } = entity;
  const hasChildren = children && children.length > 0;

  if (!region) return null;

  return (
    <ActivePolygon
      hasChildren={hasChildren}
      coordinates={region}
      // Randomize key to ensure polygon appears at top. This is still important even
      // though the polygon is in a LayerGroup due to issues with react-leaflet that
      // maintainer says are out of scope for the module.
      key={`currentOrgUnitPolygon${Math.random()}`}
    />
  );
};

export const PolygonLayer = ({ entityData }: { entityData: EntityResponse }) => {
  if (!entityData) {
    return null;
  }

  return (
    <>
      <ActiveEntity entity={entityData as EntityResponse} />
      <ChildEntities entities={entityData?.children} />
      <SiblingEntities entity={entityData} />
    </>
  );
};
