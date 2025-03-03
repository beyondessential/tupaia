import React from 'react';
import { RadioQuestion } from './RadioQuestion';

export const BinaryQuestion = ({ options = [], ...restOfProps }) => (
  <RadioQuestion options={options.length ? options : ['Yes', 'No']} {...restOfProps} />
);
