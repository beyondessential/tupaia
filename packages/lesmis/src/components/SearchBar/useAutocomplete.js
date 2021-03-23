/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */
import useMuiAutocomplete from '@material-ui/lab/useAutocomplete';

export function createFilterOptions(config = {}) {
  const { limit, ignoreCase = true, stringify, trim = false } = config;

  return (options, { inputValue, getOptionLabel }) => {
    if (inputValue === '') {
      // Todo: show recent searches
      //  @see https://app.zenhub.com/workspaces/active-sprints-5eea9d3de8519e0019186490/issues/beyondessential/tupaia-backlog/2495
      return [];
    }

    let input = trim ? inputValue.trim() : inputValue;
    if (ignoreCase) {
      input = input.toLowerCase();
    }

    const fromStartMatches = options.filter(option => {
      let candidate = (stringify || getOptionLabel)(option);
      if (ignoreCase) {
        candidate = candidate.toLowerCase();
      }

      return candidate.indexOf(input) === 0;
    });

    const anyMatches = options.filter(option => {
      let candidate = (stringify || getOptionLabel)(option);
      if (ignoreCase) {
        candidate = candidate.toLowerCase();
      }

      return candidate.substring(1).indexOf(input) > -1;
    });

    const filteredOptions = [...fromStartMatches, ...anyMatches];

    return filteredOptions.slice(0, limit);
  };
}

export const useAutocomplete = ({ inputValue, setInputValue, options, limit, onChange }) => {
  const filterOptions = createFilterOptions({
    limit,
  });

  return useMuiAutocomplete({
    id: 'location-search',
    filterOptions,
    options,
    onChange,
    inputValue,
    clearOnEscape: true,
    disableCloseOnSelect: true,
    clearOnBlur: false,
    blurOnSelect: true,
    onInputChange: (event, newValue) => {
      setInputValue(newValue);
    },
    getOptionLabel: option => option.name,
  });
};
