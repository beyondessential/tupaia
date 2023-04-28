/**
 * Tupaia MediTrak
 * Copyright (c) 2018 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';
import { InputGroup } from '@tupaia/ui-components';
import { InputField } from '../widgets';
import { checkVisibilityCriteriaAreMet, labelToId } from '../utilities';

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

  // Get the fields that are visible from an array
  const filterVisibleFields = allFields => {
    return allFields.filter(({ show = true, editConfig = {} }) => {
      const { visibilityCriteria } = editConfig;

      if (!show) {
        return false;
      }

      // show or hide a field based on another field's value
      if (visibilityCriteria) {
        return checkVisibilityCriteriaAreMet(visibilityCriteria, recordData);
      }

      return true;
    });
  };

  // Get the input for the field
  const getFieldInput = field => {
    const { editable = true, editConfig = {}, source, Header, accessor } = field;
    return (
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
    );
  };

  // Get the form fields and sections that are visible from the fields prop, handling nested sections
  const visibleFormItems = filterVisibleFields(fields).reduce((result, field) => {
    if (field.type === 'section') {
      const visibleSubfields = filterVisibleFields(field.fields);
      if (!visibleSubfields.length) return result;
      return [
        ...result,
        {
          ...field,
          fields: visibleSubfields,
        },
      ];
    }
    return [...result, field];
  }, []);

  return (
    <div>
      {visibleFormItems.map(item =>
        item.type === 'section' ? (
          <InputGroup
            key={item.title}
            title={item.title}
            description={item.description}
            fields={item.fields.map(subfield => getFieldInput(subfield))}
          />
        ) : (
          getFieldInput(item)
        ),
      )}
    </div>
  );
};

Editor.propTypes = {
  fields: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  recordData: PropTypes.object.isRequired,
  onEditField: PropTypes.func.isRequired,
};
