/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { useState } from 'react';

export const useFormFields = initialState => {
  const [fields, setValues] = useState(initialState);

  return [
    fields,
    event => {
      setValues(prevFields => ({
        ...prevFields,
        [event.target.id]: event.target.value,
      }));
    },
  ];
};
