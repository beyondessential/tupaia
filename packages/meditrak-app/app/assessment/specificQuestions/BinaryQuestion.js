/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { RadioQuestion } from './RadioQuestion';

export const BinaryQuestion = ({ options = [], ...restOfProps }) => (
  <RadioQuestion options={options.length ? options : ['Yes', 'No']} {...restOfProps} />
);
