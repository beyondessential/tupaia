export const getColumnMatcher = (columnsToMatch: '*' | string | string[]) => {
  if (columnsToMatch === '*') {
    return () => true;
  }

  if (typeof columnsToMatch === 'string') {
    return (field: string) => field === columnsToMatch;
  }

  return (field: string) => columnsToMatch.includes(field);
};
