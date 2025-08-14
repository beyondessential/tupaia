import React from 'react';
import PropTypes from 'prop-types';
import { FieldsEditor } from '../editor/FieldsEditor';
import { useEditSurveyField } from './useEditSurveyField';

export const SurveyEditFields = ({ fields, recordData, onEditField, ...restOfProps }) => {
  const handleEditField = useEditSurveyField(recordData, onEditField);

  return (
    <FieldsEditor
      fields={fields}
      recordData={recordData}
      onEditField={handleEditField}
      {...restOfProps}
    />
  );
};

SurveyEditFields.propTypes = {
  fields: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  recordData: PropTypes.object.isRequired,
  onEditField: PropTypes.func.isRequired,
};
