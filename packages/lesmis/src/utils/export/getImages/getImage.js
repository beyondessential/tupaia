/*
 * Tupaia
 *  Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

import domtoimage from 'dom-to-image';
import html2canvas from 'html2canvas';

const html2canvasToImg = async node => {
  const canvas = await html2canvas(node, { logging: false });
  return canvas.toDataURL('image/png');
};

const getFormatter = format => {
  switch (format) {
    case 'html2canvas':
      return html2canvasToImg;
    case 'png':
    default:
      return domtoimage.toPng;
  }
};

export const getImage = async (node, format) => {
  const formatter = getFormatter(format);
  return formatter(node, { bgcolor: 'white' });
};
