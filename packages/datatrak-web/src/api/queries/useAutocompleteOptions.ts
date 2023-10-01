/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { useQuery } from 'react-query';
import { Option } from '@tupaia/types';
import { get } from '../api';
import { useSurveyForm } from '../../features';

export const useAutocompleteOptions = (
  optionSetId?: string | null,
  attributeFilters?: Record<string, any>,
) => {
  const { getAnswerByQuestionId } = useSurveyForm();
  return useQuery(
    ['autocompleteOptions', optionSetId],
    (): Promise<Option[]> =>
      get(`optionSets/${optionSetId}/options`, {
        enabled: !!optionSetId,
      }),
    {
      select: data => {
        // If there are no attribute filters, return all options
        if (!attributeFilters) return data;
        return data.filter((option: Option) => {
          // If there are no attributes on the option, return true
          if (!option?.attributes) return true;
          // return only the options that match all attribute filters
          return Object.entries(attributeFilters).every(([attribute, config]) => {
            const attributeValue = getAnswerByQuestionId(config.questionId);
            return option?.attributes?.[attribute] === attributeValue;
          });
        });
      },
    },
  );
};
