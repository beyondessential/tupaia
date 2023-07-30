/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { ActivePolygon } from '@tupaia/ui-map-components';
import { useParams } from 'react-router-dom';
import { Entity, EntityCode } from '../../../types';
import { InteractivePolygon } from './InteractivePolygon';
import { useEntitiesWithLocation } from '../../../api/queries';
import { useMapOverlayReport } from '../utils';

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
  const { data: entities = [] } = useEntitiesWithLocation(projectCode, entityCode, {
    params: { includeRoot: true },
  });
  const { data: mapOverlayData } = useMapOverlayReport();

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
      {childEntities?.length > 0 &&
        childEntities.map(entity => (
          <InteractivePolygon
            key={entity.code}
            entity={entity}
            isChildArea
            isShowingData={!!mapOverlayData?.measureData}
          />
        ))}
    </>
  );
};
