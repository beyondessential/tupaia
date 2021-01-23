/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import React from 'react';

import { RadioQuestion } from './RadioQuestion';

export const BinaryQuestion = ({ options, ...props }) => {
  const binaryOptions = ['Yes', 'No'].map((value, i) =>
    JSON.stringify({
      value,
      ...JSON.parse(options[i]),
    }),
  );

  console.log('binaryOptions', binaryOptions);
  console.log('props', props);
  return <RadioQuestion options={binaryOptions} {...props} />;
};
