/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
import { Tooltip } from 'react-leaflet';
import styled from 'styled-components';
import { getSingleFormattedValue } from './utils';

const Heading = styled.span`
  text-align: center;
  font-weight: ${props => (props.hasMeasureValue ? 'bold' : 'normal')};
`;

const buildFormattedMeasureData = (orgUnitMeasureData, measureOptions) => {
  const getMetadata = (data, key) => {
    if (data.metadata) {
      return data.metadata;
    }
    const metadataKeys = Object.keys(data).filter(k => k.includes(`${key}_metadata`));
    return Object.fromEntries(metadataKeys.map(k => [k.replace(`${key}_metadata`, ''), data[k]]));
  };

  const formattedMeasureData = {};

  if (orgUnitMeasureData) {
    measureOptions.forEach(({ key, name, ...otherConfigs }) => {
      const metadata = getMetadata(orgUnitMeasureData, key);
      formattedMeasureData[name || key] = getSingleFormattedValue(orgUnitMeasureData, [
        {
          key,
          metadata,
          ...otherConfigs,
        },
      ]);
    });
  }

  return formattedMeasureData;
};

export const AreaTooltip = ({
  permanent,
  sticky,
  orgUnitName,
  hasMeasureValue,
  measureOptions,
  orgUnitMeasureData,
  text,
}) => {
  const getTextList = () => {
    const defaultTextList = [
      <Heading key={0} hasMeasureValue={hasMeasureValue}>
        {orgUnitName}
      </Heading>,
    ];

    if (!hasMeasureValue) {
      return defaultTextList;
    }

    const toTextList = data =>
      Object.keys(data).map(key => <span key={key}>{`${key}: ${data[key]}`}</span>);

    return defaultTextList.concat(
      toTextList(buildFormattedMeasureData(orgUnitMeasureData, measureOptions)),
    );
  };

  const displayText = text || getTextList();

  return (
    <Tooltip
      pane="tooltipPane"
      direction="auto"
      opacity={1}
      sticky={sticky}
      permanent={permanent}
      interactive={permanent}
    >
      <div style={{ display: 'grid' }}>{displayText}</div>
    </Tooltip>
  );
};

AreaTooltip.propTypes = {
  permanent: PropTypes.bool,
  sticky: PropTypes.bool,
  hasMeasureValue: PropTypes.bool,
  measureOptions: PropTypes.arrayOf(PropTypes.object),
  orgUnitMeasureData: PropTypes.object,
  orgUnitName: PropTypes.string,
  text: PropTypes.string,
};

AreaTooltip.defaultProps = {
  permanent: false,
  sticky: false,
  hasMeasureValue: false,
  measureOptions: [],
  orgUnitMeasureData: null,
  orgUnitName: null,
  text: null,
};
