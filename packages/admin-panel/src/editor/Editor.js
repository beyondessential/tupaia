/**
 * Tupaia MediTrak
 * Copyright (c) 2018 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';
import { InputField } from '../widgets';
import { checkVisibilityCriteriaAreMet, labelToId } from '../utilities';
import { createBase64Image } from '../utilities/createBase64Image';
import styled from 'styled-components';

const EditorWrapper = styled.div`
  .file_upload_label {
    font-size: 0.9375rem;
    text-transform: initial;
    color: ${props => props.theme.palette.text.secondary};
  }
`;

export const Editor = ({ fields, recordData, onEditField }) => {
  const onInputChange = async (inputKey, inputValue, editConfig = {}) => {
    const { setFieldsOnChange, type } = editConfig;
    let updatedValue = inputValue;
    if (type === 'image' && inputValue) {
      // If the input is a file, we need to convert the file to a base64 encoded image.
      updatedValue = await createBase64Image(inputValue);
    }
    if (setFieldsOnChange) {
      const newFields = setFieldsOnChange(updatedValue, recordData);
      Object.entries(newFields).forEach(([fieldKey, fieldValue]) => {
        onEditField(fieldKey, fieldValue);
      });
    }
    onEditField(inputKey, updatedValue);
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
    <EditorWrapper>
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
            id={`inputField-${labelToId(source)}`}
            {...editConfig}
          />
        ))}
    </EditorWrapper>
  );
};

Editor.propTypes = {
  fields: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  recordData: PropTypes.object.isRequired,
  onEditField: PropTypes.func.isRequired,
};
