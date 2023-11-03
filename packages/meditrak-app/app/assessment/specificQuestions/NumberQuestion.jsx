/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';

import { FreeTextQuestion } from './FreeTextQuestion';

export const NumberQuestion = props => {
  const { textInputProps, ...otherProps } = props;

  return (
    <FreeTextQuestion
      textInputProps={{
        ...textInputProps,
        placeholder: 'Enter a number',
        keyboardType: 'numeric',
      }}
      {...otherProps}
    />
  );
};

NumberQuestion.propTypes = {
  textInputProps: PropTypes.object,
};

NumberQuestion.defaultProps = {
  textInputProps: {},
};
