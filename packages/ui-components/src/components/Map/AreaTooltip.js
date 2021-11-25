/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
import { Tooltip } from 'react-leaflet';
import styled from 'styled-components';
import { PopupDataItemList } from './PopupDataItemList';

const Heading = styled.span`
  text-align: center;
  font-weight: ${props => (props.hasMeasureValue ? 'bold' : 'normal')};
`;

const Grid = styled.div`
  display: grid;
`;

export const AreaTooltip = ({
  permanent,
  sticky,
  orgUnitName,
  hasMeasureValue,
  serieses,
  orgUnitMeasureData,
  text,
}) => {
  return (
    <Tooltip
      pane="tooltipPane"
      direction="auto"
      opacity={1}
      sticky={sticky}
      permanent={permanent}
      interactive={permanent}
    >
      {text ? (
        <Grid>{text}</Grid>
      ) : (
        <Grid>
          <Heading key={0} hasMeasureValue={hasMeasureValue}>
            {orgUnitName}
          </Heading>
          {hasMeasureValue && (
            <PopupDataItemList key={1} serieses={serieses} data={orgUnitMeasureData} />
          )}
        </Grid>
      )}
    </Tooltip>
  );
};

AreaTooltip.propTypes = {
  permanent: PropTypes.bool,
  sticky: PropTypes.bool,
  hasMeasureValue: PropTypes.bool,
  serieses: PropTypes.arrayOf(PropTypes.object),
  orgUnitMeasureData: PropTypes.object,
  orgUnitName: PropTypes.string,
  text: PropTypes.string,
};

AreaTooltip.defaultProps = {
  permanent: false,
  sticky: false,
  hasMeasureValue: false,
  serieses: [],
  orgUnitMeasureData: {},
  orgUnitName: null,
  text: null,
};
