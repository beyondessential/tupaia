import { Option, OptionSet } from '@tupaia/types';

import { get } from '../api';
import { useSurveyForm } from '../../features';
import { useDatabaseQuery } from './useDatabaseQuery';
import { DatatrakWebModelRegistry } from '../../types';
import { useIsOfflineFirst } from '../offlineFirst';
import { getAutocompleteOptions } from '../../database';

export interface GetAutocompleteOptionsLocalContext {
  models: DatatrakWebModelRegistry;
  optionSetId?: OptionSet['id'];
  searchText?: string;
}

const getAutocompleteOptionsOnline = async ({
  optionSetId,
  searchText,
}: GetAutocompleteOptionsLocalContext) =>
  await get(`optionSets/${optionSetId}/options`, {
    params: {
      filter: searchText
        ? JSON.stringify({
            value: {
              comparator: 'ilike',
              comparisonValue: `%${searchText}%`,
            },
          })
        : undefined,
    },
  });

export const useAutocompleteOptions = (
  optionSetId?: OptionSet['id'] | null,
  attributeFilters?: Record<string, any>,
  searchText?: string,
) => {
  const isOfflineFirst = useIsOfflineFirst();
  const { getAnswerByQuestionId } = useSurveyForm();

  return useDatabaseQuery<Option[]>(
    ['autocompleteOptions', optionSetId, searchText],
    isOfflineFirst ? getAutocompleteOptions : getAutocompleteOptionsOnline,
    {
      select: data => {
        // If there are no attribute filters, return all options
        if (!attributeFilters) return data;
        return data.filter((option: Option) => {
          // If there are no attributes on the option, return true
          if (!option.attributes) return true;
          // return only the options that match all attribute filters
          return Object.entries(attributeFilters).every(([attribute, config]) => {
            const attributeValue = getAnswerByQuestionId(config.questionId);
            if (attributeValue === undefined) return false;
            // if it is another autocomplete question, these are shaped differently
            if (attributeValue.hasOwnProperty('value'))
              return option?.attributes?.[attribute] === attributeValue?.value;
            return option?.attributes?.[attribute] === attributeValue;
          });
        });
      },
      localContext: {
        optionSetId,
        searchText,
      },
      enabled: !!optionSetId,
    },
  );
};
