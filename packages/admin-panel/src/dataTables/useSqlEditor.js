/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { useState, useEffect } from 'react';
import debounce from 'lodash.debounce';

export const useSqlEditor = ({ recordData, onEditField }) => {
  const { config = {} } = recordData;
  const [sql, setSql] = useState(config?.sql || '');

  useEffect(() => {
    const debouncedEditSql = debounce(() => {
      onEditField('config', { ...config, sql });
    }, 100);

    debouncedEditSql();
    return debouncedEditSql.cancel;
  }, [sql]);

  return { sql, setSql };
};
