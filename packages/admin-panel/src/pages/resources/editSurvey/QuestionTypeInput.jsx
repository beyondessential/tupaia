/**
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { QuestionType } from '@tupaia/types';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { FormControl, MenuItem, Select } from '@material-ui/core';

const QuestionTypeOptions = Object.values(QuestionType).map(type => ({
  label: type,
  value: type,
}));

const SelectInput = styled(Select)`
  font-size: inherit;
  border-radius: 0;
  .MuiSelect-selectMenu {
    min-height: unset;
    font-size: inherit;
  }
`;

export const QuestionTypeInput = ({ value, onChange, id, variant }) => {
  return (
    <FormControl id={id} fullWidth>
      <SelectInput value={value} onChange={onChange} variant={variant}>
        {QuestionTypeOptions.map(option => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </SelectInput>
    </FormControl>
  );
};

QuestionTypeInput.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  id: PropTypes.string,
  variant: PropTypes.string,
};

QuestionTypeInput.defaultProps = {
  id: 'question-type-input',
  variant: 'standard',
};
