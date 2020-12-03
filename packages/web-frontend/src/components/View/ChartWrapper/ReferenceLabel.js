/**
 * Tupaia Web
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */

import React from 'react';

function returnTrueIfMax(value) {
  if (value.includes('MAX') || value.includes('Max') || value.includes('max')) return true;
  return false;
}

function ReferenceLabel(props) {
  const { fill, fontSize, value, viewBox } = props;
  const x = viewBox.width / 2 + 30;
  const defaultY = viewBox.y + 15;
  const maxY = viewBox.y - 5;
  const getYPosition = returnTrueIfMax(value) ? maxY : defaultY;

  if (value == null) return null;
  return (
    <text x={x} y={getYPosition} fill={fill} fontSize={fontSize || 14} fontWeight="bolder">
      {`${value}`}
    </text>
  );
}

export default ReferenceLabel;
