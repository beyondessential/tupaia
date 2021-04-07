/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */
import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { Polygon as PolygonComponent, useMap } from 'react-leaflet';
import styled from 'styled-components';
import { blue } from '@material-ui/core/colors';
import { AreaTooltip } from './AreaTooltip';

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

export const Polygon = ({ orgUnit }) => {
  const coordinates = orgUnit.location.region;

  return (
    <BasicPolygon positions={coordinates} interactive={false}>
      <AreaTooltip permanent text={orgUnit.name} />
    </BasicPolygon>
  );
};

Polygon.propTypes = {
  orgUnit: PropTypes.shape({
    name: PropTypes.string,
    location: PropTypes.object,
  }).isRequired,
};

export const ConnectedPolygon = ({ orgUnit }) => {
  const map = useMap();
  const coordinates = orgUnit.location.region;

  const eventHandlers = useMemo(
    () => ({
      click() {
        map.fitBounds(orgUnit.location.bounds);
      },
    }),
    [],
  );

  return <Polygon positions={coordinates} eventHandlers={eventHandlers} />;
};

ConnectedPolygon.propTypes = {
  orgUnit: PropTypes.shape({
    name: PropTypes.string,
    location: PropTypes.object,
    bounds: PropTypes.array,
  }).isRequired,
};
