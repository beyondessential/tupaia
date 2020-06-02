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
      const { value, id } = event.target;
      setValues(prevFields => ({
        ...prevFields,
        [id]: value,
      }));
    },
  ];
};
