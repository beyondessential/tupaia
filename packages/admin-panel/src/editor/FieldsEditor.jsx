import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { InputGroup } from '@tupaia/ui-components';
import { checkVisibilityCriteriaAreMet, labelToId, useHasVizBuilderAccess } from '../utilities';
import { SECTION_FIELD_TYPE } from './constants';
import { EditorInputField } from './EditorInputField';
import { getFieldEditKey } from './utils';
import { useUser } from '../api/queries';

const EditorWrapper = styled.form`
  .file_upload_label {
    font-size: 0.9375rem;
    text-transform: initial;
    color: ${props => props.theme.palette.text.secondary};
  }
  .MuiFormHelperText-root {
    text-align: right;
    margin-right: 0;
  }
  .MuiFormControl-root:has(.MuiFormHelperText-root) {
    margin-bottom: 0; // the helper text will be considered the gap between the input and the next field
  }
`;

export const onInputChange = async (
  inputKey,
  inputValue,
  editConfig = {},
  recordData,
  onEditField,
) => {
  const { setFieldsOnChange } = editConfig;
  if (setFieldsOnChange) {
    const newFields = setFieldsOnChange(inputValue, recordData);
    Object.entries(newFields).forEach(([fieldKey, fieldValue]) => {
      onEditField(fieldKey, fieldValue);
    });
  }
  onEditField(inputKey, inputValue);
};

export const FieldsEditor = ({ fields, recordData, onEditField, onSetFormFile }) => {
  const hasVizBuilderAccess = useHasVizBuilderAccess();
  if (!fields || fields.length === 0) {
    return false;
  }

  const selectValue = (editConfig, accessor, source) => {
    if (editConfig.accessor) {
      return editConfig.accessor(recordData);
    }
    if (accessor) {
      return accessor(recordData);
    }
    if (editConfig.sourceKey) {
      return recordData[editConfig.sourceKey];
    }
    return recordData[source];
  };

  // Get the fields that are visible from an array
  const filterVisibleFields = allFields => {
    return allFields.filter(({ show = true, editConfig = {} }) => {
      const { visibilityCriteria, needsVizBuilderAccess } = editConfig;

      // hide the field (edit visual button) if the user does not have Viz Builder access
      if (needsVizBuilderAccess && !hasVizBuilderAccess) {
        return false;
      }

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
    const {
      editable = true,
      editConfig = {},
      source,
      Header,
      accessor,
      type,
      WrapperComponent,
      required,
    } = field;
    if (type === SECTION_FIELD_TYPE) {
      return (
        <InputGroup
          key={Header}
          title={Header}
          fields={field.fields.map(subfield => getFieldInput(subfield))}
          WrapperComponent={WrapperComponent}
        />
      );
    }
    const editKey = getFieldEditKey(field);
    return (
      <EditorInputField
        key={source}
        inputKey={source}
        label={Header}
        onChange={(inputKey, value) =>
          onInputChange(inputKey, value, editConfig, recordData, onEditField)
        }
        onSetFormFile={onSetFormFile}
        value={selectValue(editConfig, accessor, source)}
        disabled={!editable}
        recordData={recordData}
        id={`inputField-${labelToId(source)}`}
        required={required}
        editKey={editKey}
        {...editConfig}
      />
    );
  };

  // Get the form fields and sections that are visible from the fields prop, handling nested sections
  const visibleFormItems = filterVisibleFields(fields).reduce((result, field) => {
    if (field.type === SECTION_FIELD_TYPE) {
      const visibleSubfields = filterVisibleFields(field.fields);
      if (!visibleSubfields.length) return result;
      result.push({
        ...field,
        fields: visibleSubfields,
      });
      return result;
    }

    result.push(field);
    return result;
  }, []);

  return <EditorWrapper className="fields">{visibleFormItems.map(getFieldInput)}</EditorWrapper>;
};

FieldsEditor.propTypes = {
  fields: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  recordData: PropTypes.object.isRequired,
  onEditField: PropTypes.func.isRequired,
  onSetFormFile: PropTypes.func.isRequired,
};
