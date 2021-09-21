/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';
import { Polygon } from 'react-leaflet';
import styled from 'styled-components';
import { AreaTooltip } from './AreaTooltip';
import { MAP_COLORS, BREWER_PALETTE } from './constants';
import ActivePolygon from './ActivePolygon';

const { POLYGON_BLUE, POLYGON_HIGHLIGHT } = MAP_COLORS;

const BasicPolygon = styled(Polygon)`
  fill: ${POLYGON_BLUE};
  fill-opacity: 0.04;
  stroke-width: 1;
  stroke: ${POLYGON_BLUE};

  :hover {
    fill-opacity: 0.5;
    stroke: ${POLYGON_HIGHLIGHT};
    fill: ${POLYGON_HIGHLIGHT};
  }
`;

export const ShadedPolygon = styled(Polygon)`
  fill-opacity: 0.5;

  &:hover {
    fill-opacity: 0.8;
  }
`;

const parseProps = (organisationUnitCode, organisationUnitChildren, measureOrgUnits) => {
  let shade;
  let isHidden;
  let orgUnitMeasureData;
  let hasShadedChildren = false;

  if (measureOrgUnits.length > 0) {
    const measureOrgUnitCodes = new Set(
      measureOrgUnits.map(orgUnit => orgUnit.organisationUnitCode),
    );

    hasShadedChildren =
      organisationUnitChildren &&
      organisationUnitChildren.some(child => measureOrgUnitCodes.has(child.organisationUnitCode));

    if (measureOrgUnitCodes.has(organisationUnitCode)) {
      orgUnitMeasureData = measureOrgUnits.find(
        orgUnit => orgUnit.organisationUnitCode === organisationUnitCode,
      );

      if (orgUnitMeasureData) {
        shade = orgUnitMeasureData.color;
        isHidden = orgUnitMeasureData.isHidden;
      }
    }
  }

  return { shade, isHidden, hasShadedChildren, orgUnitMeasureData };
};

export const InteractivePolygon = React.memo(
  ({
    isChildArea,
    hasMeasureData,
    measureOptions,
    permanentLabels,
    onChangeOrgUnit,
    area,
    isActive,
    measureOrgUnits,
    organisationUnitChildren,
  }) => {
    const { organisationUnitCode } = area;
    const coordinates = area.location?.region;
    const hasChildren = organisationUnitChildren && organisationUnitChildren.length > 0;

    const { shade, isHidden, hasShadedChildren, orgUnitMeasureData } = parseProps(
      organisationUnitCode,
      organisationUnitChildren,
      measureOrgUnits,
    );

    if (isHidden || !coordinates) return null;

    if (isActive) {
      return (
        <ActivePolygon
          shade={shade}
          hasChildren={hasChildren}
          hasShadedChildren={hasShadedChildren}
          coordinates={coordinates}
          // Randomize key to ensure polygon appears at top. This is still important even
          // though the polygon is in a LayerGroup due to issues with react-leaflet that
          // maintainer says are out of scope for the module.
          key={`currentOrgUnitPolygon${Math.random()}`}
        />
      );
    }

    let PolygonComponent = BasicPolygon;
    let color;

    if (shade) {
      PolygonComponent = ShadedPolygon;
      // To match with the color in markerIcon.js which uses BREWER_PALETTE
      color = BREWER_PALETTE[shade] || shade;
    }

    const hasMeasureValue = !!(orgUnitMeasureData || orgUnitMeasureData === 0);
    const hideTooltip = hasMeasureData && !hasMeasureValue;

    return (
      <PolygonComponent
        positions={coordinates}
        pathOptions={{
          color,
          fillColor: color,
        }}
        eventHandlers={{
          click: () => {
            return onChangeOrgUnit(organisationUnitCode);
          },
        }}
      >
        {!hideTooltip && (
          <AreaTooltip
            permanent={permanentLabels && isChildArea && !hasMeasureValue}
            sticky={!permanentLabels}
            hasMeasureValue={hasMeasureValue}
            measureOptions={measureOptions}
            orgUnitMeasureData={orgUnitMeasureData}
            orgUnitName={area.name}
          />
        )}
      </PolygonComponent>
    );
  },
);

InteractivePolygon.propTypes = {
  area: PropTypes.shape({
    name: PropTypes.string,
    type: PropTypes.string,
    location: PropTypes.object,
    organisationUnitCode: PropTypes.string,
  }).isRequired,
  isActive: PropTypes.bool,
  permanentLabels: PropTypes.bool,
  isChildArea: PropTypes.bool,
  onChangeOrgUnit: PropTypes.func,
  hasMeasureData: PropTypes.bool,
  measureOptions: PropTypes.arrayOf(PropTypes.object),
  measureOrgUnits: PropTypes.arrayOf(PropTypes.object),
  organisationUnitChildren: PropTypes.arrayOf(PropTypes.object),
};

InteractivePolygon.defaultProps = {
  isActive: false,
  permanentLabels: true,
  isChildArea: false,
  onChangeOrgUnit: () => {},
  hasMeasureData: false,
  measureOptions: [],
  organisationUnitChildren: [],
  measureOrgUnits: [],
};
