/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

export const removeSemicolon = (rawSql: string) => {
  const sql = rawSql.trim();
  if (sql.endsWith(';')) {
    return sql.substring(0, sql.length - 1);
  }
  return sql;
};
