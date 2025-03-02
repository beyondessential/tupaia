import { FormLabelProps } from '@material-ui/core';
import React, { ReactNode, useEffect } from 'react';

import { useCurrentUserContext, useProjectSurveys } from '../api';
import { SurveyFolderIcon, SurveyIcon } from '../components';
import { Survey } from '../types';

import { useUserCountries } from './CountrySelector/useUserCountries';

export type ListItemType = Record<string, unknown> & {
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
};

const alphanumericCompare = (a: ListItemType, b: ListItemType) => {
  return (a.content as string).trim()?.localeCompare((b.content as string).trim(), 'en', {
    numeric: true,
  });
};

export const useGroupedSurveyList = ({ setSelectedSurvey, selectedSurvey }) => {
  const user = useCurrentUserContext();
  const { selectedCountry } = useUserCountries();
  const { data: surveys } = useProjectSurveys(user?.projectId, selectedCountry?.code);
  const groupedSurveys =
    surveys
      ?.reduce((acc: ListItemType[], survey: Survey) => {
        const { surveyGroupName, name, code } = survey;
        const formattedSurvey = {
          content: name,
          value: code,
          selected: selectedSurvey === code,
          icon: <SurveyIcon />,
        };
        // if there is no surveyGroupName, add the survey to the list as a top level item
        if (!surveyGroupName) {
          return [...acc, formattedSurvey];
        }
        const group = acc.find(({ content }) => content === surveyGroupName);
        // if the surveyGroupName doesn't exist in the list, add it as a top level item
        if (!group) {
          return [
            ...acc,
            {
              content: surveyGroupName,
              icon: <SurveyFolderIcon />,
              value: surveyGroupName,
              children: [formattedSurvey],
            },
          ];
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
