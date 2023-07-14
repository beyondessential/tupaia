/*
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';
import QrCodeMatrix from 'react-native-qrcode-svg';
import Svg, { G, Rect, Text } from 'react-native-svg';

const CODE_SVG_RATIO = 0.65;
const TEXT_VERTICAL_RATIO = 0.15;

export const QrCode = ({ getRef, qrCodeContents, humanReadableId, size }) => {
  const codeSize = size * CODE_SVG_RATIO;
  const textBoxHeight = size * TEXT_VERTICAL_RATIO;
  const textBoxPadding = (size - codeSize - textBoxHeight) / 2;
  const fontSize = 0.5 * textBoxHeight;
  const textXOffset = size / 2;
  const textYOffset = textBoxPadding / 2 + textBoxHeight / 2 - fontSize / 2;
  const codeXOffset = (size - codeSize) / 2;
  const codeYOffset = textBoxHeight + textBoxPadding;
  return (
    <Svg ref={getRef} height={size} width={size}>
      <Rect x="0" y="0" height={size} width={size} fill="white" />
      <Text
        fill="black"
        fontSize={fontSize}
        x={textXOffset}
        y={textYOffset}
        textAnchor="middle"
        textLength={humanReadableId.length}
        alignmentBaseline="center"
      >
        {humanReadableId}
      </Text>
      <G x={codeXOffset} y={codeYOffset}>
        <QrCodeMatrix size={codeSize} value={qrCodeContents} />
      </G>
    </Svg>
  );
};

QrCode.propTypes = {
  getRef: PropTypes.func,
  qrCodeContents: PropTypes.string.isRequired,
  humanReadableId: PropTypes.string.isRequired,
  size: PropTypes.number,
};

QrCode.defaultProps = {
  getRef: () => null,
  size: 200,
};
