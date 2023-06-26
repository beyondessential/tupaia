/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { InteractivePolygon } from './InteractivePolygon';
import { ActivePolygon } from '@tupaia/ui-map-components';
import { useEntities } from '../../api/queries';
import { useParams } from 'react-router-dom';

const ChildEntities = ({ entities }) => {
  return entities.map(entity => <InteractivePolygon key={entity.code} entity={entity} />);
};

const ENTITY_FIELDS = ['parent_code', 'code', 'name', 'type', 'bounds', 'region'];

const SiblingEntities = ({ entity }) => {
  const { projectCode } = useParams();
  const { data: siblingEntities, isLoading } = useEntities(projectCode, entity.parentCode, {
    params: { fields: ENTITY_FIELDS },
  });

  if (isLoading || !siblingEntities) {
    return null;
  }
  console.log('siblingEntities', siblingEntities);

  return siblingEntities?.children?.map(entity => (
    <InteractivePolygon key={entity.code} entity={entity} />
  ));
};

const ACTIVE_SHADE = '#EE6230';

const ActiveEntity = ({ entity }) => {
  const { code, region, children } = entity;
  const hasChildren = children?.length > 0;

  if (!region) return null;

  return (
    <ActivePolygon
      shade={ACTIVE_SHADE}
      hasChildren={hasChildren}
      coordinates={region}
      // Randomize key to ensure polygon appears at top. This is still important even
      // though the polygon is in a LayerGroup due to issues with react-leaflet that
      // maintainer says are out of scope for the module.
      key={code}
    />
  );
};

export const PolygonLayer = ({ entity }) => {
  if (!entity) {
    return null;
  }

  return (
    <>
      <ActiveEntity entity={entity} />
      <ChildEntities entities={entity?.children} />
      <SiblingEntities entity={entity} />
    </>
  );
};
