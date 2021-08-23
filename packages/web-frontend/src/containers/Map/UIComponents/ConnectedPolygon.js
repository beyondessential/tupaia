/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';
import { Polygon } from '@tupaia/ui-components/lib/map';
import styled from 'styled-components';
import { AreaTooltip } from '../AreaTooltip';
import { MAP_COLORS, BREWER_PALETTE } from '../../../styles';
import ActivePolygon from './ActivePolygon';

const { POLYGON_BLUE, POLYGON_HIGHLIGHT } = MAP_COLORS;

const BasicPolygon = styled(Polygon)`
  fill: ${POLYGON_BLUE};
  fill-opacity: 0.04;
  stroke-width: 1;
  :hover {
    fill-opacity: 0.5;
    stroke: ${POLYGON_HIGHLIGHT};
    fill: ${POLYGON_HIGHLIGHT};
  }
`;

export const ShadedPolygon = styled(Polygon)`
  weight: 1;
  fill-opacity: 0.5;
  :hover {
    fill-opacity: 0.8;
  }
`;

const getProps = (organisationUnitCode, organisationUnitChildren, measureOrgUnits) => {
  let shade;
  let isHidden;
  let orgUnitMeasureData;
  let hasShadedChildren = false;

  if (measureOrgUnits.length > 0) {
    const measureOrgUnitCodes = measureOrgUnits.map(orgUnit => orgUnit.organisationUnitCode);

    hasShadedChildren =
      organisationUnitChildren &&
      organisationUnitChildren.some(child =>
        measureOrgUnitCodes.includes(child.organisationUnitCode),
      );

    if (measureOrgUnitCodes.includes(organisationUnitCode)) {
      orgUnitMeasureData = measureOrgUnits.find(
        orgUnit => orgUnit.organisationUnitCode === organisationUnitCode,
      );
      if (orgUnitMeasureData) {
        shade = orgUnitMeasureData.color;
        isHidden = orgUnitMeasureData.isHidden;
      }
    }
  }

  const hasChildren = organisationUnitChildren && organisationUnitChildren.length > 0;

  return { shade, isHidden, hasShadedChildren, hasChildren };
};

export const ConnectedPolygon = ({
  isChildArea,
  hasMeasureData,
  orgUnitMeasureData,
  measureOptions,
  permanentLabels,
  onChangeOrgUnit,
  area,
  isActive,
  measureOrgUnits,
  organisationUnitChildren,
}) => {
  const { organisationUnitCode } = area;

  const { shade, isHidden, hasChildren, hasShadedChildren } = getProps(
    organisationUnitCode,
    organisationUnitChildren,
    measureOrgUnits,
  );

  if (isHidden) return null;

  const coordinates = area.location?.region;

  if (!coordinates) return null;

  if (isActive) {
    return (
      <ActivePolygon
        shade={shade}
        hasChildren={hasChildren}
        hasShadedChildren={hasShadedChildren}
        coordinates={coordinates}
        // Randomize key to ensure polygon appears at top. This is still imporatant even
        // though the polygon is in a LayerGroup due to issues with react-leaflet that
        // maintainer says are out of scope for the module.
        key={`currentOrgUnitPolygon${Math.random()}`}
      />
    );
  }

  const defaultProps = {
    positions: coordinates,
    eventHandlers: {
      click: () => {
        return onChangeOrgUnit(organisationUnitCode);
      },
    },
  };

  const Tooltip = () => {
    const hasMeasureValue = !!(orgUnitMeasureData || orgUnitMeasureData === 0);
    // don't render tooltips if we have a measure loaded
    // and don't have a value to display in the tooltip (ie: radius overlay)
    if (hasMeasureData && !hasMeasureValue) return null;

    return (
      <AreaTooltip
        // permanent={permanentLabels && isChildArea && !hasMeasureValue}
        sticky={!permanentLabels}
        hasMeasureValue={hasMeasureValue}
        measureOptions={measureOptions}
        orgUnitMeasureData={orgUnitMeasureData}
        orgUnitName={area.name}
        interactive={false}
      />
    );
  };

  if (shade) {
    // To match with the color in markerIcon.js which uses BREWER_PALETTE
    const color = BREWER_PALETTE[shade] || shade;

    // Work around: color should go through the styled components
    // but there is a rendering bug between Styled Components + Leaflet
    return (
      <ShadedPolygon {...defaultProps} color={color}>
        <Tooltip />
      </ShadedPolygon>
    );
  }

  return (
    <BasicPolygon {...defaultProps}>
      <Tooltip />
    </BasicPolygon>
  );
};

ConnectedPolygon.propTypes = {
  area: PropTypes.shape({
    name: PropTypes.string,
    type: PropTypes.string,
    organisationUnitCode: PropTypes.string,
  }).isRequired,
  measureId: PropTypes.string,
  isActive: PropTypes.bool,
  permanentLabels: PropTypes.bool,
  isChildArea: PropTypes.bool,
  onChangeOrgUnit: PropTypes.func,
  hasMeasureData: PropTypes.bool,
  measureOptions: PropTypes.arrayOf(PropTypes.object),
  hasChildren: PropTypes.bool,
  hasShadedChildren: PropTypes.bool,
  shade: PropTypes.string,
  isHidden: PropTypes.bool,
  orgUnitMeasureData: PropTypes.shape({
    value: PropTypes.any,
    originalValue: PropTypes.any,
    metadata: PropTypes.any,
    submissionDate: PropTypes.any,
  }),
};

ConnectedPolygon.defaultProps = {
  measureId: '',
  isActive: false,
  permanentLabels: true,
  isChildArea: false,
  onChangeOrgUnit: () => {},
  hasMeasureData: false,
  measureOptions: [],
  hasChildren: false,
  hasShadedChildren: false,
  shade: undefined,
  isHidden: false,
  orgUnitMeasureData: undefined,
};
