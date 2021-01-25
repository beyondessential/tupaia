/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';
import { RadioQuestion } from './RadioQuestion';

export const BinaryQuestion = ({ options, ...props }) => {
  const binaryOptions = options.length
    ? ['Yes', 'No'].map((value, i) =>
        JSON.stringify({
          value,
          ...(options[i] ? JSON.parse(options[i]) : {}),
        }),
      )
    : ['Yes', 'No'];

  return <RadioQuestion options={binaryOptions} {...props} />;
};

BinaryQuestion.propTypes = {
  options: PropTypes.array,
};

BinaryQuestion.defaultProps = {
  options: [],
};
