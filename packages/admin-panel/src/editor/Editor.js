/**
 * Tupaia MediTrak
 * Copyright (c) 2018 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';
import { InputField } from '../widgets';
import { checkVisibilityCriteriaAreMet } from '../utilities';

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

  const selectValue = (editConfig, accessor, source) => {
    if (editConfig.accessor) {
      return editConfig.accessor(recordData);
    }
    if (accessor) {
      return accessor(recordData);
    }
    return recordData[source];
  };

  return (
    <div>
      {fields
        .filter(({ show = true, editConfig = {} }) => {
          const { visibilityCriteria } = editConfig;

          if (!show) {
            return false;
          }

          // show or hide a field based on another field's value
          if (visibilityCriteria) {
            return checkVisibilityCriteriaAreMet(visibilityCriteria, recordData);
          }

          return true;
        })
        .map(({ editable = true, editConfig = {}, source, Header, accessor }) => (
          <InputField
            key={source}
            inputKey={source}
            label={Header}
            onChange={(inputKey, inputValue) => onInputChange(inputKey, inputValue, editConfig)}
            value={selectValue(editConfig, accessor, source)}
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
