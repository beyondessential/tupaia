/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 *
 */
import React from 'react';
import PropTypes from 'prop-types';
import { ICON_BASE_SIZE } from './constants';

export const IconContainer = ({ children, scale, ...props }) => (
  <svg
    width={`${ICON_BASE_SIZE * scale}px`}
    height={`${ICON_BASE_SIZE * scale}px`}
    viewBox="0 0 1000 1000"
    style={{ marginRight: '0.25rem' }}
    {...props}
  >
    {children}
  </svg>
);

IconContainer.propTypes = {
  children: PropTypes.node,
  scale: PropTypes.number,
};

IconContainer.defaultProps = {
  children: null,
  scale: 1,
};
