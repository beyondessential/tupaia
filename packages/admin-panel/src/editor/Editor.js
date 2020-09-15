/**
 * Tupaia MediTrak
 * Copyright (c) 2018 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';
import { InputField } from '../widgets';

export const Editor = ({ fields, recordData, onEditField }) => {
  const onInputChange = (inputKey, inputValue, editConfig = {}) => {
    const { setFieldsOnChange } = editConfig;
    if (setFieldsOnChange) {
      const newFields = setFieldsOnChange(inputValue, recordData);
      Object.entries(newFields).forEach(([fieldKey, fieldValue]) => {
        onEditField(fieldKey, fieldValue);
      });
    }

    onEditField(inputKey, inputValue);
  };

  return (
    <div>
      {fields
        .filter(({ show = true }) => show)
        .map(({ editable = true, editConfig = {}, source, Header, accessor }) => (
          <InputField
            key={source}
            inputKey={source}
            label={Header}
            onChange={(inputKey, inputValue) => onInputChange(inputKey, inputValue, editConfig)}
            value={accessor ? accessor(recordData) : recordData[source]}
            disabled={!editable}
            recordData={recordData}
            {...editConfig}
          />
        ))}
    </div>
  );
};

Editor.propTypes = {
  fields: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  recordData: PropTypes.object.isRequired,
  onEditField: PropTypes.func.isRequired,
};
