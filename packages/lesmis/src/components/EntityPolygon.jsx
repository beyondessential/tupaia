import React from 'react';
import PropTypes from 'prop-types';
import { Polygon as PolygonComponent } from 'react-leaflet';
import styled from 'styled-components';
import { blue } from '@material-ui/core/colors';
import { AreaTooltip } from '@tupaia/ui-map-components';

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

export const EntityPolygon = ({ entity }) => {
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

EntityPolygon.propTypes = {
  entity: PropTypes.shape({
    name: PropTypes.string,
    region: PropTypes.array,
  }),
};

EntityPolygon.defaultProps = {
  entity: null,
};
