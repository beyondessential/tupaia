/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { ActivePolygon, POLYGON_MEASURE_TYPES } from '@tupaia/ui-map-components';
import { useParams } from 'react-router-dom';
import { Entity, EntityCode } from '../../../types';
import { InteractivePolygon } from './InteractivePolygon';
import { useEntitiesWithLocation, useEntity, useMapOverlays } from '../../../api/queries';

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

  const children = siblingEntities
    .filter(entity => entity.code !== activeEntityCode)
    .filter(entity => entity.parentCode === parentEntityCode);

  return (
    <>
      {children.map(entity => (
        <InteractivePolygon key={entity.code} entity={entity} />
      ))}
    </>
  );
};

const ActiveEntity = ({ entity }: { entity: Entity }) => {
  const { region, childCodes } = entity;
  const hasChildren = childCodes && childCodes.length > 0;

  if (!region) return null;

  return (
    <ActivePolygon
      hasChildren={hasChildren}
      hasShadedChildren={true}
      coordinates={region}
      // Randomize key to ensure polygon appears at top. This is still important even
      // though the polygon is in a LayerGroup due to issues with react-leaflet that
      // maintainer says are out of scope for the module.
      key={`currentOrgUnitPolygon${Math.random()}`}
    />
  );
};

export const PolygonNavigationLayer = () => {
  const { projectCode, entityCode } = useParams();
  const { selectedOverlay } = useMapOverlays(projectCode, entityCode);
  const { data: activeEntity } = useEntity(projectCode, entityCode);
  const { data: entities } = useEntitiesWithLocation(projectCode, entityCode);

  if (!entities || entities.length === 0) {
    return null;
  }

  const childEntities = entities.filter((entity: Entity) => entity.parentCode === entityCode);

  const showChildEntities =
    !POLYGON_MEASURE_TYPES.includes(selectedOverlay?.displayType) && childEntities?.length > 0;

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
      {showChildEntities &&
        childEntities.map((entity: Entity) => (
          <InteractivePolygon
            key={entity.code}
            entity={entity}
            isChildArea
            isShowingData={!!selectedOverlay}
          />
        ))}
    </>
  );
};
