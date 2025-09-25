import { FormLabelProps } from '@material-ui/core';
import React, { ReactNode, useEffect } from 'react';

import { useCurrentUserContext } from '../api';
import { useSurveysQuery } from '../api/queries/useSurveysQuery';
import { SurveyFolderIcon, SurveyIcon } from '../components';
import { Survey } from '../types';
import { innerText } from '../utils';
import { UserCountriesType } from './CountrySelector/useUserCountries';

export interface ListItemType extends Record<string, unknown> {
  children?: ListItemType[];
  content: string | ReactNode;
  value: string;
  selected?: boolean;
  icon?: ReactNode;
  tooltip?: string;
  button?: boolean;
  disabled?: boolean;
  labelProps?: FormLabelProps & {
    component?: React.ElementType;
  };
}

const alphanumericCompare = <T extends { content: React.ReactNode }>(a: T, b: T): number => {
  const aText = innerText(a.content).trim();
  const bText = innerText(b.content).trim();
  return aText.localeCompare(bText, 'en', {
    numeric: true,
  });
};

export interface UseGroupedSurveyListParams {
  selectedCountry: UserCountriesType['selectedCountry'];
  selectedSurvey: Survey['code'] | null;
  setSelectedSurvey: React.Dispatch<React.SetStateAction<Survey['code'] | null>>;
}

export const useGroupedSurveyList = ({
  selectedCountry,
  selectedSurvey,
  setSelectedSurvey,
}: UseGroupedSurveyListParams) => {
  const user = useCurrentUserContext();
  const { data: surveys } = useSurveysQuery({
    countryCode: selectedCountry?.code,
    includeSurveyGroupNames: true,
    projectId: user?.projectId,
  });
  const groupedSurveys =
    surveys
      ?.reduce<ListItemType[]>((acc, survey) => {
        const { surveyGroupName, name, code } = survey;
        const formattedSurvey = {
          content: name,
          value: code,
          selected: selectedSurvey === code,
          icon: <SurveyIcon />,
        };
        // if there is no surveyGroupName, add the survey to the list as a top level item
        if (!surveyGroupName) {
          acc.push(formattedSurvey);
          return acc;
        }
        const group = acc.find(({ content }) => content === surveyGroupName);
        // if the surveyGroupName doesn't exist in the list, add it as a top level item
        if (!group) {
          acc.push({
            content: surveyGroupName,
            icon: <SurveyFolderIcon />,
            value: surveyGroupName,
            children: [formattedSurvey],
          });
          return acc;
        }
        // if the surveyGroupName exists in the list, add the survey to the children
        return acc.map(item => {
          if (item.content === surveyGroupName) {
            return {
              ...item,
              // sort the folder items alphanumerically
              children: [...(item.children || []), formattedSurvey].sort(alphanumericCompare),
            };
          }
          return item;
        });
      }, [])
      ?.sort(alphanumericCompare) ?? [];

  useEffect(() => {
    // when the surveys change, check if the selected survey is still in the list. If not, clear the selection
    if (selectedSurvey && !surveys?.find(survey => survey.code === selectedSurvey)) {
      setSelectedSurvey(null);
    }
  }, [JSON.stringify(surveys)]);

  const onSelectSurvey = (listItem: ListItemType | null) => {
    if (!listItem) return setSelectedSurvey(null);
    setSelectedSurvey(listItem?.value as Survey['code']);
  };

  return {
    groupedSurveys,
    onSelectSurvey,
  };
};
