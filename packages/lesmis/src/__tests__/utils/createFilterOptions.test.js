import { createFilterOptions } from '../../utils/useAutocomplete';
import options from './exampleOptions.json';

const getFilterResults = (inputValue, limit = 10) => {
  const filter = createFilterOptions({
    limit,
  });

  return filter(options, { inputValue, getOptionLabel: option => option.name });
};

describe('Search Bar createFilterOptions', () => {
  it('Returns the correct maximum number of options', () => {
    expect(getFilterResults('b', 5).length).toBe(5);
    expect(getFilterResults('b', 12).length).toBe(12);
  });

  it('Returns an empty array when nothing is searched', () => {
    expect(getFilterResults('', 5).length).toBe(0);
  });

  const zeExampleResults = [
    'Azerbaijan',
    'Belize',
    'Bosnia and Herzegovina',
    'Czech Republic',
    'New Zealand',
    'Switzerland',
  ];

  it('Returns all the correct options', () => {
    expect(getFilterResults('Vatican')[0].name).toBe('Holy See (Vatican City State)');
    expect(getFilterResults('Honduras')[0].name).toBe('Honduras');
    expect(getFilterResults('belg')[0].name).toBe('Belgium');

    const zeResults = getFilterResults('ze');

    expect(zeResults.every(result => zeExampleResults.includes(result.name))).toBe(true);
    expect(zeResults.length).toBe(6);
  });

  it('Filters with macrons', () => {
    expect(getFilterResults('Åland')[0].name).toBe('Åland Islands');
  });

  it('Returns options that start with the search first', () => {
    expect(getFilterResults('an')[0].name).toBe('AndorrA');
    expect(getFilterResults('an')[5].name).toBe('Afghanistan');
  });
});
