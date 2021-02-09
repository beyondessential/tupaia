/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';

const isMaxLabel = value => value.toLowerCase().includes('max');

export const ReferenceLabel = ({ fill, fontSize, value, viewBox }) => {
  const x = viewBox.width / 2 + 30;
  const y = isMaxLabel(value) ? viewBox.y - 5 : viewBox.y + 15;

  if (value == null) return null;
  return (
    <text x={x} y={y} fill={fill} fontSize={fontSize} fontWeight="bolder">
      {`${value}`}
    </text>
  );
};

ReferenceLabel.propTypes = {
  value: PropTypes.string.isRequired,
  fill: PropTypes.string.isRequired,
  viewBox: PropTypes.object,
  fontSize: PropTypes.number,
};

ReferenceLabel.defaultProps = {
  fontSize: 14,
  viewBox: null,
};
