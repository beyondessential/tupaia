/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { POLYGON_MEASURE_TYPES } from '@tupaia/ui-map-components';
import { useParams } from 'react-router-dom';
import { Entity, EntityCode } from '../../../types';
import { InteractivePolygon } from './InteractivePolygon';
import { useEntitiesWithLocation, useEntity, useMapOverlays } from '../../../api/queries';
import { ActiveEntityPolygon } from './ActiveEntityPolygon';
import { useMapOverlayData } from '../utils';

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

export const PolygonNavigationLayer = () => {
  const { projectCode, entityCode } = useParams();
  const { selectedOverlay } = useMapOverlays(projectCode, entityCode);
  const { isLoading: isLoadingOverlayReport } = useMapOverlayData();
  const { data: activeEntity } = useEntity(projectCode, entityCode);

  const { data: entities } = useEntitiesWithLocation(projectCode, entityCode);

  if (!entities || entities.length === 0) {
    return null;
  }

  const childEntities = entities.filter((entity: Entity) => entity.parentCode === entityCode);

  const isPolygonOverlay = POLYGON_MEASURE_TYPES.includes(selectedOverlay?.displayType);

  // while the overlay report is loading, we only want to show the child entity tooltips when the active entity is a project
  const showChildEntityTooltips =
    isLoadingOverlayReport && activeEntity?.type === 'project' ? true : !selectedOverlay;

  // while the overlay report is loading, we want to show the child entities on the map
  const showChildEntities =
    (isLoadingOverlayReport || !isPolygonOverlay) && childEntities?.length > 0;

  const showActiveEntity =
    activeEntity &&
    activeEntity?.type?.replace('_', '') !== selectedOverlay?.measureLevel?.toLowerCase();

  return (
    <>
      {showActiveEntity && (
        <>
          <ActiveEntityPolygon entity={activeEntity} />
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
            isShowingData={!showChildEntityTooltips}
          />
        ))}
    </>
  );
};
