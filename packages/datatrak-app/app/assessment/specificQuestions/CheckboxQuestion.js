/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';

import { Checkbox } from '../../widgets';

export const CheckboxQuestion = ({ answer, onChangeAnswer, questionText }) => (
  <Checkbox
    key={questionText}
    labelSide="left"
    labelText={questionText}
    isChecked={answer === 'Yes'}
    onToggle={() => onChangeAnswer(answer === 'Yes' ? 'No' : 'Yes')}
  />
);

CheckboxQuestion.propTypes = {
  answer: PropTypes.string,
  onChangeAnswer: PropTypes.func.isRequired,
  questionText: PropTypes.string.isRequired,
};

CheckboxQuestion.defaultProps = {
  answer: 'No',
};
