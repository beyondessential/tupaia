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

export const Tooltip = row => (
  <TooltipComponent title={row.value} placement="top-start">
    <Cell>{row.value}</Cell>
  </TooltipComponent>
);

Tooltip.propTypes = {
  row: PropTypes.object.isRequired,
};
