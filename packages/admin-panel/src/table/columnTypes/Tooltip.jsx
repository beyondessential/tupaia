/**
 * Tupaia MediTrak
 * Copyright (c) 2018 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';
import { Tooltip as TooltipComponent } from '@tupaia/ui-components';
import styled from 'styled-components';

const Cell = styled.div`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const Tooltip = ({ value }) => (
  <TooltipComponent title={value || ''} placement="top-start">
    <Cell>{value}</Cell>
  </TooltipComponent>
);

Tooltip.propTypes = {
  value: PropTypes.oneOfType([PropTypes.object, PropTypes.array, PropTypes.string]),
};

Tooltip.defaultProps = {
  value: '',
};

export const JSONTooltip = ({ value }) => (
  <TooltipComponent title={<pre>{JSON.stringify(value, null, 1)}</pre>}>
    <Cell>{JSON.stringify(value)}</Cell>
  </TooltipComponent>
);

JSONTooltip.propTypes = {
  value: PropTypes.oneOfType([PropTypes.object, PropTypes.array, PropTypes.string]),
};

JSONTooltip.defaultProps = {
  value: '',
};
