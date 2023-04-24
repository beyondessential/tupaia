/**
 * Tupaia MediTrak
 * Copyright (c) 2018 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';
import { InputGroup } from '@tupaia/ui-components';
import { InputField } from '../widgets';
import { checkVisibilityCriteriaAreMet, labelToId } from '../utilities';

export const Editor = ({ fields, recordData, onEditField, sections }) => {
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

  // Get the input field
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

  // The sections that are visible, and their associated input fields
  const visibleSections = sections.reduce((result, section) => {
    const visibleFields = filterVisibleFields(section.fields);
    // If none of the fields are visible, don't show the section
    if (!visibleFields.length) return result;
    return [
      ...result,
      {
        ...section,
        fields: visibleFields.reduce((fieldResult, fieldName) => {
          const fieldInfo = fields.find(f => f.source === fieldName);
          if (!fieldInfo) return fieldResult;
          return [...fieldResult, getFieldInput(fieldInfo)];
        }, []),
      },
    ];
  }, []);

  // The fields that are not part of a larger subsection
  const standaloneFields = fields.filter(field => {
    if (!sections.length) return true;
    const { source } = field;
    return !sections.find(section => section.fields.includes(source));
  });

  return (
    <div>
      {/** Display the sections first, then the standalone fields */}
      {visibleSections.map(({ title, fields: sectionFields, description }) => (
        <InputGroup title={title} description={description} fields={sectionFields} />
      ))}
      {filterVisibleFields(standaloneFields).map(field => getFieldInput(field))}
    </div>
  );
};

Editor.propTypes = {
  fields: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  recordData: PropTypes.object.isRequired,
  onEditField: PropTypes.func.isRequired,
  sections: PropTypes.arrayOf(
    PropTypes.shape({
      /** the section heading */
      title: PropTypes.string,
      /** the section description */
      description: PropTypes.string,
      /** an array of field names */
      fields: PropTypes.arrayOf(PropTypes.string),
    }),
  ),
};

Editor.defaultProps = {
  sections: [],
};
