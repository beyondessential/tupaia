/*
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';
import QrCodeMatrix from 'react-native-qrcode-svg';
import Svg, { G, Rect, Text } from 'react-native-svg';

const BASE_IMG_WIDTH = 1400;
const BASE_IMG_HEIGHT = 500;
const BASE_FONT_SIZE = 90;
const CODE_PADDING_PERCENT = 0.1;

export const QrCode = ({ getRef, qrCodeContents, humanReadableId, width }) => {
  const scale = width / BASE_IMG_WIDTH;
  const imageWidth = width;
  const imageHeight = scale * BASE_IMG_HEIGHT;
  const codeContainerSize = imageHeight;
  const codePadding = CODE_PADDING_PERCENT * imageHeight;
  const codeSize = imageHeight - 2 * codePadding;
  const textBoxWidth = imageWidth - codeContainerSize + codePadding;
  const fontSize = scale * BASE_FONT_SIZE;
  const textXOffset = textBoxWidth / 2;
  const textYOffset = (imageHeight - fontSize) / 2;
  const codeXOffset = textBoxWidth;
  return (
    <Svg ref={getRef} height={imageHeight} width={imageWidth}>
      <Rect x="0" y="0" height={imageHeight} width={imageWidth} fill="white" />
      <Text
        fill="black"
        fontFamily="monospace"
        fontSize={fontSize}
        x={textXOffset}
        y={textYOffset}
        textAnchor="middle"
        textLength={humanReadableId.length}
        alignmentBaseline="center"
      >
        {humanReadableId}
      </Text>
      <G x={codeXOffset} y={codePadding}>
        <QrCodeMatrix size={codeSize} value={qrCodeContents} />
      </G>
    </Svg>
  );
};

QrCode.propTypes = {
  getRef: PropTypes.func,
  qrCodeContents: PropTypes.string.isRequired,
  humanReadableId: PropTypes.string.isRequired,
  width: PropTypes.number,
};

QrCode.defaultProps = {
  getRef: () => null,
  width: 300,
};
