type SearchResult = {
  name: string;
  parent?: {
    name: string;
  };
};

export function sortSearchResults(searchString: string, results: SearchResult[]) {
  const lowerSearch = searchString.toLowerCase();

  const primarySearchResults = results.filter(({ name }) =>
    name.toLowerCase().startsWith(lowerSearch),
  );

  const secondarySearchResults = results.filter(
    ({ name, parent }) =>
      !name.toLowerCase().startsWith(lowerSearch) &&
      (name.toLowerCase().includes(lowerSearch) ||
        parent?.name.toLowerCase().startsWith(lowerSearch)),
  );

  return [...primarySearchResults, ...secondarySearchResults];
}
