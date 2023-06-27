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
  if (!entities) {
    return null;
  }
  return entities.map(entity => (
    <InteractivePolygon key={entity.code} entity={entity} isChildArea />
  ));
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

  const children = siblingEntities?.children.filter(e => e.code !== entity.code) || [];

  return children.map(entity => <InteractivePolygon key={entity.code} entity={entity} />);
};

const ActiveEntity = ({ entity }) => {
  const { code, region, children } = entity;
  const hasChildren = children?.length > 0;

  // orgUnitMeasureData
  const isHidden = false;
  const shade = false;
  const hasShadedChildren = false;

  // const hasShadedChildren = children?.some(child => measureOrgUnitCodes.has(child.code));

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

export const PolygonLayer = ({ entity, mapOverlayData }) => {
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
