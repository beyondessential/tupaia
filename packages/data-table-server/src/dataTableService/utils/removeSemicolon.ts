export const removeSemicolon = (rawSql: string) => {
  const sql = rawSql.trim();
  if (sql.endsWith(';')) {
    return sql.substring(0, sql.length - 1);
  }
  return sql;
};
