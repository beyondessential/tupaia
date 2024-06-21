/**
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */
import React, { useEffect } from 'react';
import styled from 'styled-components';
import { FormLabelProps } from '@material-ui/core';
import { Country } from '@tupaia/types';
import { ListItemType, SelectList, SurveyFolderIcon, SurveyIcon } from '../components';
import { Survey } from '../types';
import { useCurrentUserContext, useProjectSurveys } from '../api';

const ListWrapper = styled.div`
  max-height: 35rem;
  display: flex;
  flex-direction: column;
  overflow: auto;
  flex: 1;
  ${({ theme }) => theme.breakpoints.down('sm')} {
    max-height: 100%;
  }
`;

const sortAlphanumerically = (a: ListItemType, b: ListItemType) => {
  return (a.content as string).trim()?.localeCompare((b.content as string).trim(), 'en', {
    numeric: true,
  });
};

interface GroupedSurveyListProps {
  setSelectedSurvey: (surveyCode: Survey['code'] | null) => void;
  selectedSurvey: Survey['code'] | null;
  selectedCountry?: Country | null;
  label?: string;
  labelProps?: FormLabelProps & {
    component?: React.ElementType;
  };
}

export const GroupedSurveyList = ({
  setSelectedSurvey,
  selectedSurvey,
  selectedCountry,
  label,
  labelProps,
}: GroupedSurveyListProps) => {
  const user = useCurrentUserContext();
  const { data: surveys } = useProjectSurveys(user?.projectId, selectedCountry?.name);
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
              children: [...(item.children || []), formattedSurvey].sort(sortAlphanumerically),
            };
          }
          return item;
        });
      }, [])
      ?.sort(sortAlphanumerically) ?? [];

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
  return (
    <ListWrapper>
      <SelectList
        items={groupedSurveys}
        onSelect={onSelectSurvey}
        label={label}
        labelProps={labelProps}
      />
    </ListWrapper>
  );
};
