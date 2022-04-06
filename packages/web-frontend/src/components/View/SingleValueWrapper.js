/*
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import PropTypes from 'prop-types';
import styled, { css } from 'styled-components';
import { VIEW_CONTENT_SHAPE } from './propTypes';
import { ViewTitle } from './Typography';
import { VIEW_STYLES, WHITE } from '../../styles';
import { formatDataValue, isMobile } from '../../utils';

const DataWrapper = styled.div`
  font-size: 50px;
  font-weight: bold;
  text-align: center;
  color: ${WHITE};

  ${!isMobile() &&
  css`
    flex-grow: 1;
    flex-shrink: 1;
    flex-basis: auto;
    white-space: pre-line;
  `}
`;

export const SingleValueWrapper = ({ viewContent, style }) => {
  const { name, valueType, dataColor, value, total, value_metadata: valueMetadata } = viewContent;
  const metadata = valueMetadata || viewContent[`${name}_metadata`];

  return (
    <div style={VIEW_STYLES.viewContainer}>
      <ViewTitle>{name}</ViewTitle>
      <DataWrapper style={{ color: dataColor, ...style }}>
        {formatDataValue(value, valueType, { ...metadata, total })}
      </DataWrapper>
    </div>
  );
};

SingleValueWrapper.propTypes = {
  viewContent: PropTypes.shape(VIEW_CONTENT_SHAPE).isRequired,
  style: PropTypes.object,
};

SingleValueWrapper.defaultProps = {
  style: {},
};
