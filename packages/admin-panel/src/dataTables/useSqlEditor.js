/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

export const useSqlEditor = ({ recordData, onEditField }) => {
  const { config = {} } = recordData;
  const { sql = '' } = config;

  const setSql = newSql => {
    onEditField('config', { ...config, sql: newSql });
  };
  return { sql, setSql };
};
