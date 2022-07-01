/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { useRef } from 'react';

import { getImage } from './getImage';

// Customised for dashboards pdf export
export const useCustomGetImages = () => {
  const refs = useRef([]);
  refs.current = [];

  const getImgs = async () => {
    const imgs = [];
    for (let i = 0; i < refs.current.length; i++) {
      // Hacky way to take screenshot for the first profile page with `html2canvas` as `domtoimage` can't access material-ui css file.
      // More on this, `html2canvas` can return a better resolution screenshots than `domtoimage`, but it requires much longer time.
      const format = i === 0 ? 'html2canvas' : 'png';
      const image = await getImage(refs.current[i], format);
      imgs.push(image);
    }

    return imgs;
  };

  return { getImgs };
};
