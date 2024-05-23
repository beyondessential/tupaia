/**
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import { useEffect, useState } from 'react';
import { useDebounce } from '../utilities';
import { useApiContext } from '../utilities/ApiProvider';
import { useSuggestSurveyCode } from './useSuggestSurveyCode';

export const useEditSurveyField = (recordData, onEditField) => {
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

  return handleEditField;
};
