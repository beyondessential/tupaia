/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import { useState } from 'react';

export const useFormFields = initialState => {
  const [fields, setValues] = useState(initialState);

  const handleFieldValue = event => {
    console.log('event', event.target.value);
    console.log('event', event.target.checked);
    setValues({
      ...fields,
      [event.target.id]: event.target.value,
    });
  };

  return [fields, handleFieldValue];
};
