/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import React from 'react';

import { Instruction } from './Instruction';

export const UnsupportedQuestion = props => (
  <Instruction
    {...props}
    questionText="This question type is not supported by your version of Tupaia MediTrak."
    detailText="Please upgrade to the latest version and restart the survey"
  />
);
