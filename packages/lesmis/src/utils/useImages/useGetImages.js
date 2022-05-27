/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { useRef, useState } from 'react';

import { getImage } from './getImage';

export const useGetImages = formate => {
  const [isExporting, setIsExporting] = useState(false);
  const refs = useRef([]);
  refs.current = [];
  const addToRefs = el => {
    if (el && !refs.current.includes(el)) {
      refs.current.push(el);
    }
  };

  const getImgs = async () => {
    setIsExporting(true);
    const imgs = [];

    for (const node of refs.current) {
      const image = await getImage(node, formate);
      imgs.push(image);
    }

    setIsExporting(false);
    return imgs;
  };

  return { isExporting, addToRefs, getImgs };
};
