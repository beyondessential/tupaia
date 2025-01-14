import useMuiAutocomplete from '@material-ui/lab/useAutocomplete';

export function createFilterOptions(config = {}) {
  const { limit, ignoreCase = true, stringify = false, trim = false } = config;

  return (options, { inputValue, getOptionLabel }) => {
    const anyMatches = [];
    const primaryMatches = [];

    if (inputValue === '') {
      // Todo: show recent searches
      //  @see https://app.zenhub.com/workspaces/active-sprints-5eea9d3de8519e0019186490/issues/beyondessential/tupaia-backlog/2495
      return [];
    }

    let input = trim ? inputValue.trim() : inputValue;
    if (ignoreCase) {
      input = input.toLowerCase();
    }

    for (const option of options) {
      let candidate = (stringify || getOptionLabel)(option);
      if (ignoreCase) {
        candidate = candidate.toLowerCase();
      }

      if (candidate.startsWith(input)) {
        primaryMatches.push(option); // Matches start
      } else if (candidate.substring(1).indexOf(input) > -1) {
        anyMatches.push(option); // Matches anywhere
      }

      if (primaryMatches.length === limit) {
        return primaryMatches;
      }
    }
    return [...primaryMatches, ...anyMatches].slice(0, limit);
  };
}

export const useAutocomplete = ({
  id,
  inputValue,
  setInputValue,
  options,
  limit,
  onChange,
  muiProps,
}) => {
  const filterOptions = createFilterOptions({
    limit,
  });

  return useMuiAutocomplete({
    blurOnSelect: true,
    clearOnEscape: true,
    clearOnBlur: false,
    disableCloseOnSelect: true,
    filterOptions,
    getOptionLabel: option => option.name,
    id,
    inputValue,
    options,
    onChange,
    onInputChange: (event, newValue) => {
      setInputValue(newValue);
    },
    ...muiProps,
  });
};
