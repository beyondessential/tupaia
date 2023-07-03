/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { ActivePolygon } from '@tupaia/ui-map-components';
import { useParams } from 'react-router-dom';
import { EntityResponse, EntityCode } from '../../types';
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

const SiblingEntities = ({
  parentEntityCode,
  activeEntityCode,
}: {
  parentEntityCode: EntityCode;
  activeEntityCode: EntityCode;
}) => {
  const { projectCode } = useParams();
  const { data: siblingEntities, isLoading } = useEntitiesWithLocation(
    projectCode,
    parentEntityCode,
  );

  if (isLoading || !siblingEntities || siblingEntities.length === 0) {
    return null;
  }

  const children = siblingEntities.filter(entity => entity.code !== activeEntityCode);

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

export const PolygonLayer = () => {
  const { projectCode, entityCode } = useParams();
  const { data: entities = [] } = useEntitiesWithLocation(projectCode, entityCode);

  if (!entities || entities.length === 0) {
    return null;
  }

  const activeEntity = entities.find(entity => entity.code === entityCode);
  const childEntities = entities.filter(entity => entity.parentCode === entityCode);

  return (
    <>
      {activeEntity && (
        <>
          <ActiveEntity entity={activeEntity} />
          <SiblingEntities
            activeEntityCode={activeEntity.code}
            parentEntityCode={activeEntity.parentCode}
          />
        </>
      )}
      <ChildEntities entities={childEntities} />
    </>
  );
};
