import { GetAutocompleteOptionsLocalContext } from '../../api/queries/useAutocompleteOptions';

export const getAutocompleteOptions = async ({
  models,
  optionSetId,
  searchText,
}: GetAutocompleteOptionsLocalContext) => {
  return await models.option.find({
    option_set_id: optionSetId,
    ...(searchText ? { value: { comparator: 'ilike', comparisonValue: `%${searchText}%` } } : {}),
  });
};
