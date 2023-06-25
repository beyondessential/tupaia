/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { Entity } from '@tupaia/types';
import { Polygon as PolygonComponent } from 'react-leaflet';
import { AreaTooltip } from '@tupaia/ui-map-components';
import styled from 'styled-components';
import { blue } from '@material-ui/core/colors';

export const POLYGON_COLOR = '#EE6230';

const BasicPolygon = styled(PolygonComponent)`
  fill: ${blue['500']};
  fill-opacity: 0.04;
  stroke-width: 1;
  :hover {
    fill-opacity: 0.5;
    stroke: ${POLYGON_COLOR};
    fill: ${POLYGON_COLOR};
  }
`;

const ActiveEntityPolygon = ({ entity }: { entity?: Entity }) => {
  if (!entity || !Array.isArray(entity.region)) {
    return null;
  }

  const { name, region } = entity;

  return (
    <BasicPolygon positions={region} interactive={false}>
      <AreaTooltip text={name} />
    </BasicPolygon>
  );
};

const VisibleChildEntities = () => {
  return null;
};

const SiblingEntities = () => {
  return null;
};

export const PolygonLayer = ({ entity }) => {
  return (
    <>
      <ActiveEntityPolygon entity={entity} />
      <VisibleChildEntities />
      <SiblingEntities />
    </>
  );
};
