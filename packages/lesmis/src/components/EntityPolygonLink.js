/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */
import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { useHistory } from 'react-router-dom';
import { blue } from '@material-ui/core/colors';
import { Polygon as PolygonComponent } from 'react-leaflet';
import { AreaTooltip } from '@tupaia/ui-components/lib/map';
import { makeEntityLink } from '../utils';

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

export const EntityPolygonLink = ({ entity }) => {
  const history = useHistory();
  const { region, name, code } = entity;

  const eventHandlers = useMemo(
    () => ({
      click() {
        history.push(makeEntityLink(code, 'map'));
      },
    }),
    [],
  );

  return (
    <BasicPolygon positions={region} eventHandlers={eventHandlers}>
      <AreaTooltip text={name} />
    </BasicPolygon>
  );
};

EntityPolygonLink.propTypes = {
  entity: PropTypes.shape({
    code: PropTypes.string,
    name: PropTypes.string,
    region: PropTypes.array,
  }).isRequired,
};
