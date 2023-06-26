/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { Polygon } from 'react-leaflet';
import styled from 'styled-components';
import { useParams, useNavigate } from 'react-router-dom';
import { AreaTooltip, MAP_COLORS } from '@tupaia/ui-map-components';
import { useEntityLink } from '../../utils';
import { useProject } from '../../api/queries';

const { POLYGON_BLUE, POLYGON_HIGHLIGHT } = MAP_COLORS;

const BasicPolygon = styled(Polygon)`
  fill: ${POLYGON_BLUE};
  fill-opacity: 0.04;
  stroke-width: 1;
  &:hover {
    fill-opacity: 0.5;
    stroke: ${POLYGON_HIGHLIGHT};
    fill: ${POLYGON_HIGHLIGHT};
  }
`;

const useProjectConfig = () => {
  const { projectCode } = useParams();
  const { data: project, isLoading } = useProject(projectCode);
  return { permanentLabels: project?.config?.permanentRegionLabels, isLoading };
};

export const InteractivePolygon = ({ entity }) => {
  const link = useEntityLink(entity.code);
  const { permanentLabels } = useProjectConfig();

  const navigate = useNavigate();

  const { code, name, region, bounds, children } = entity;

  if (!region) return null;

  // Todo: find out what this is for
  const hasMeasureValue = false;
  const isChildArea = true;

  return (
    <BasicPolygon positions={region} eventHandlers={{ click: () => navigate(link) }}>
      <AreaTooltip
        permanent={permanentLabels && isChildArea && !hasMeasureValue}
        sticky={!permanentLabels}
        hasMeasureValue={hasMeasureValue}
        orgUnitName={name}
      />
    </BasicPolygon>
  );
};
