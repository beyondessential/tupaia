import { useQuery } from '@tanstack/react-query';
import { Option } from '@tupaia/types';
import { get } from '../api';
import { useSurveyForm } from '../../features';

export const useAutocompleteOptions = (
  optionSetId?: string | null,
  attributeFilters?: Record<string, any>,
  searchText?: string,
) => {
  const { getAnswerByQuestionId } = useSurveyForm();
  return useQuery(
    ['autocompleteOptions', optionSetId, searchText],
    (): Promise<Option[]> =>
      get(`optionSets/${optionSetId}/options`, {
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
        enabled: !!optionSetId,
      }),
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
    },
  );
};
