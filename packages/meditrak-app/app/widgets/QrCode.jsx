import React from 'react';
import PropTypes from 'prop-types';
import QrCodeMatrix from 'react-native-qrcode-svg';
import Svg, { G, Rect, Text } from 'react-native-svg';
import { wrapText } from '../utilities/wrapQrCodeText';

const BASE_IMG_WIDTH = 1400;
const BASE_IMG_HEIGHT = 500;
const BASE_FONT_SIZE = 90;
const CODE_PADDING_PERCENT = 0.1;

// eslint-disable-next-line react/prop-types,consistent-return
const renderLabel = ({ scale, humanReadableId, textBoxWidth, textBoxHeight }) => {
  const fontSize = scale * BASE_FONT_SIZE;

  const wrappedTextLines = wrapText(humanReadableId);
  if (wrappedTextLines.length === 1) {
    const textY = textBoxHeight / 2;
    const textX = textBoxWidth / 2;
    const [text] = wrappedTextLines;
    return (
      <Text
        fill="black"
        fontFamily="monospace"
        fontSize={fontSize}
        x={textX}
        y={textY}
        textAnchor="middle"
        textLength={text.length}
        alignmentBaseline="center"
      >
        {text}
      </Text>
    );
  }
  const textElements = [];
  for (let i = 0; i < wrappedTextLines.length; i++) {
    const lineHeight = 30;
    const allLinesHeight = lineHeight * wrappedTextLines.length;
    const linesStartY = (textBoxHeight - allLinesHeight) / 2 - 5;
    const textY = linesStartY + lineHeight * i + lineHeight / 2;
    const textX = 20;
    textElements.push(
      <Text
        fill="black"
        fontFamily="monospace"
        fontSize={fontSize}
        x={textX}
        y={textY}
        key={i}
        textAnchor="start"
        textLength={wrappedTextLines[i].length}
        alignmentBaseline="center"
      >
        {wrappedTextLines[i]}
      </Text>,
    );
  }
  return textElements;
};

export const QrCode = ({ getRef, qrCodeContents, humanReadableId, width }) => {
  const scale = width / BASE_IMG_WIDTH;
  const imageWidth = width;
  const imageHeight = scale * BASE_IMG_HEIGHT;
  const codeContainerSize = imageHeight;
  const codePadding = CODE_PADDING_PERCENT * imageHeight;
  const codeSize = imageHeight - 2 * codePadding;
  const textBoxWidth = imageWidth - codeContainerSize + codePadding;
  const textBoxHeight = imageHeight;
  const codeXOffset = textBoxWidth;

  return (
    <Svg ref={getRef} height={imageHeight} width={imageWidth}>
      <Rect x="0" y="0" height={imageHeight} width={imageWidth} fill="white" />
      {renderLabel({
        scale,
        humanReadableId,
        textBoxWidth,
        textBoxHeight,
      })}
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
