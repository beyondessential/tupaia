/*
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { FieldsEditor } from '../editor/FieldsEditor';
import { useSuggestSurveyCode } from './useSuggestSurveyCode';
import { useApiContext } from '../utilities/ApiProvider';
import { useDebounce } from '../utilities';

export const SurveyEditFields = ({ fields, recordData, onEditField, ...restOfProps }) => {
  const { name } = recordData;
  const debouncedName = useDebounce(name);

  const [codeTouched, setCodeTouched] = useState(false);
  const api = useApiContext();
  const { data } = useSuggestSurveyCode(api, debouncedName);
  const suggestedCode = data;

  const handleEditField = (k, v) => {
    if (k === 'code') {
      setCodeTouched(true);
    }
    onEditField(k, v);
  };

  useEffect(() => {
    if (!codeTouched) {
      onEditField('code', suggestedCode);
    }
  }, [suggestedCode]);

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
